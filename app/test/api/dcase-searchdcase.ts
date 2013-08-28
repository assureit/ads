///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')
import model_tag = module('../../model/tag')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化
var _ = require('underscore');

var userId = 101;

describe('api', function() {
    var con;
	beforeEach(function (done) {
		testdata.load(['test/api/dcase-searchdcase.yaml'], (err:any) => {
	        con = new db.Database();
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});
	describe('dcase', function() {
		describe('searchDCase', function() {

			it('should return result', function(done) {
				dcase.searchDCase(null, userId, {
					onSuccess: (result: any) => {
						expect(result).not.to.be(null);
						expect(result.dcaseList).not.to.be(null);
						expect(result.dcaseList).to.be.an('array');
						expect(result.dcaseList.length).greaterThan(0);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('dcaseList should be limited length', function(done) {
				dcase.searchDCase({page: 1}, userId, {
					onSuccess: (result: any) => {
						assert.equal(20, result.dcaseList.length);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('provides paging feature', function(done) {
				dcase.searchDCase({page:1}, userId, {
					onSuccess: (result: any) => {
						expect(result.summary).not.to.be(undefined);
						expect(result.summary.currentPage).not.to.be(undefined);
						expect(result.summary.maxPage).not.to.be(undefined);
						expect(result.summary.totalItems).not.to.be(undefined);
						expect(result.summary.itemsPerPage).not.to.be(undefined);

						con.query('SELECT count(d.id) as cnt FROM dcase d, commit c, user u, user cu, (SELECT p.* FROM project p, project_has_user pu WHERE p.id = pu.project_id AND (p.public_flag = TRUE OR pu.user_id = ?)) p WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE AND p.id = d.project_id', [userId], (err, expectedResult) => {
							if (err) {
								con.close();
								throw err;
							}
							expect(result.summary.totalItems).to.be(expectedResult[0].cnt);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('can return next page result', function(done) {
				dcase.searchDCase({page:1}, userId, {
					onSuccess: (result1st: any) => {
						dcase.searchDCase({page:2}, userId, {
							onSuccess: (result: any) => {
								assert.notEqual(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('allow page 0 as 1', function(done) {
				dcase.searchDCase({page:1}, userId, {
					onSuccess: (result1st: any) => {
						dcase.searchDCase({page:0}, userId, {
							onSuccess: (result: any) => {
								assert.equal(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('allow minus page as 1', function(done) {
				dcase.searchDCase({page:1}, userId, {
					onSuccess: (result1st: any) => {
						dcase.searchDCase({page:-1}, userId, {
							onSuccess: (result: any) => {
								assert.equal(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('should start from offset 0', function(done) {
				// 最初のクエリとsearchDCaseの実行間にcreateDCaseが走ってエラーになったことがあったかもしれない。
				var con = new db.Database();
				con.query('SELECT d.* FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified desc, c.id desc LIMIT 1', (err, expectedResult) => {
					if (err) {
						con.close();
						throw err;
					}
					dcase.searchDCase({page:1}, userId, {
						onSuccess: (result: any) => {
							assert.equal(result.dcaseList[0].dcaseId, expectedResult[0].id);
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
					});
				});
			});

			var _assertHavingTags = (tagList:string[], dcaseId:number, callback: (err:any)=>void) => {
				con.query('SELECT t.* FROM tag t, dcase_tag_rel r WHERE r.tag_id = t.id AND r.dcase_id=?', [dcaseId], (err, result) => {
					expect(err).to.be(null);
					_.each(tagList, (tag:string) => {
						var find = _.find(result, (it:any)=>{return it.label == tag});
						expect(find).not.to.be(undefined);
						expect(find).not.to.be(null);
					});
					callback(null);
				});
			}

			var _assertHavingTagsAll = (tagList:string[], dcaseIdList:number[], callback: (err:any)=>void) => {
				if (dcaseIdList.length == 0) {
					callback(null);
					return;
				}
				_assertHavingTags(tagList, dcaseIdList[0], (err:any)=> {
					_assertHavingTagsAll(tagList, dcaseIdList.slice(1), callback);
				});
			}

			var _assertReadPermission = (dcaseId:number, userId:number, callback: (err:any) => void) => {
				con.query('SELECT count(d.id) as cnt FROM dcase d, project_has_user pu, project p WHERE d.project_id = p.id AND p.id = pu.project_id AND (p.public_flag = TRUE OR pu.user_id = ?) AND d.id = ?', [userId, dcaseId], (err:any, result:any) => {
					expect(err).to.be(null);
					expect(result[0].cnt).greaterThan(0);
					callback(err);
				});
			}
			var _assertReadPermissionAll = (dcaseIdList:number[], userId:number, callback: (err:any)=>void) => {
				if (dcaseIdList.length == 0) {
					callback(null);
					return;
				}
				_assertReadPermission(dcaseIdList[0], userId, (err:any)=> {
					_assertReadPermissionAll(dcaseIdList.slice(1), userId, callback);
				});
			}

			var _assertProjectId = (dcaseId:number, projectId:number, callback: (err:any) => void) => {
				con.query('SELECT count(d.id) as cnt FROM dcase d WHERE id = ? AND project_id = ?', [dcaseId, projectId], (err:any, result:any) => {
					expect(err).to.be(null);
					expect(result[0].cnt).greaterThan(0);
					callback(err);
				});
			}
			var _assertProjectIdAll = (dcaseIdList:number[], projectId:number, callback: (err:any)=>void) => {
				if (dcaseIdList.length == 0) {
					callback(null);
					return;
				}
				_assertProjectId(dcaseIdList[0], projectId, (err:any)=> {
					_assertProjectIdAll(dcaseIdList.slice(1), projectId, callback);
				});
			}
			it('should return public or project relative dcase', function(done) {
				dcase.searchDCase({}, userId, {
					onSuccess: (result: any) => {
						expect(result.dcaseList.length).greaterThan(0);
						_assertReadPermissionAll(_.map(result.dcaseList, (dcase:any) => {return dcase.dcaseId;}), userId, (err:any)=> {
							expect(err).to.be(null);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});
			it('should return relative dcase if tagList is not empty', function(done) {
				var tags = ['tag1'];
				dcase.searchDCase({tagList:tags, page:1}, userId, {
					onSuccess: (result: any) => {
						expect(result.dcaseList.length).greaterThan(0);
						_assertHavingTagsAll(tags, _.map(result.dcaseList, (dcase:any) => {return dcase.dcaseId;}), (err:any)=> {
							expect(err).to.be(null);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('should return project relative dcase if projectId is not empty', function(done) {
				var projectId:number = 206;
				dcase.searchDCase({projectId:projectId, page:1}, userId, {
					onSuccess: (result: any) => {
						expect(result.dcaseList.length).greaterThan(0);
						_assertProjectIdAll(_.map(result.dcaseList, (dcase:any) => {return dcase.dcaseId;}), projectId, (err:any)=> {
							expect(err).to.be(null);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});
			it('multi tagList should be AND query', function(done) {
				var tags = ['tag1', 'tag2'];
				dcase.searchDCase({tagList:tags, page:1}, userId, {
					onSuccess: (result: any) => {
						expect(result.dcaseList.length).greaterThan(0);
						_assertHavingTagsAll(tags, _.map(result.dcaseList, (dcase:any) => {return dcase.dcaseId;}), (err:any)=> {
							expect(err).to.be(null);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('tagList should be all tag list if argument tagList is empty', function(done) {
				dcase.searchDCase({page: 1}, userId, {
					onSuccess: (result: any) => {
						expect(result.tagList).not.to.be(null);
						expect(result.tagList).to.be.an('array');
						var tagDAO = new model_tag.TagDAO(con);
						tagDAO.list((err:any, tagList:model_tag.Tag[]) => {
							expect(result.tagList.length).to.equal(tagList.length);
							var modelTagList = _.map(tagList, (modelTag:model_tag.Tag) => {return modelTag.label;});
							expect(_.difference(result.tagList, modelTagList)).to.be.empty();
							expect(_.difference(modelTagList, result.tagList)).to.be.empty();
							done();
						})
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});

			it('tagList should be filterd by search result dcase if argument tagList is not empty', function(done) {
				var tags = ['tag1', 'tag2'];
				dcase.searchDCase({tagList:tags, page:1}, userId, {
					onSuccess: (result: any) => {
						expect(result.tagList).not.to.be(null);
						expect(result.tagList).to.be.an('array');
						_.each(result.tagList, (tag:string) => {
							expect(tag).not.to.equal('deleted_tag');
							expect(tag).not.to.equal('unlink_tag');
							expect(tag).not.to.equal('unrelational_tag');
						});
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
				});
			});
			// TODO タグのプロジェクトによるフィルタリング
			// getTagListもpublic_flagおよび所属projectでフィルタリング
			// getCommitList、getDCase、getNodeTreeも権限チェック
		});
	});
});
