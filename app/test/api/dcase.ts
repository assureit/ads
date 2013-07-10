///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var userId = constant.SYSTEM_USER_ID;

describe('api', function() {
    var con;
	beforeEach(function (done) {
		testdata.load(['test/api/dcase.yaml'], (err:any) => {
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
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});

			it('dcaseList should be limited length', function(done) {
				dcase.searchDCase({page: 1}, userId, {
					onSuccess: (result: any) => {
						assert.equal(20, result.dcaseList.length);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
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

						con.query('SELECT count(d.id) as cnt FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE', (err, expectedResult) => {
							if (err) {
								con.close();
								throw err;
							}
							expect(result.summary.totalItems).to.be(expectedResult[0].cnt);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
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
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
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
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
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
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});

			it('should start from offset 0', function(done) {
				// 最初のクエリとsearchDCaseの実行間にcreateDCaseが走ってエラーになったことがあったかもしれない。
				var con = new db.Database();
				con.query('SELECT d.* FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified, c.id desc LIMIT 1', (err, expectedResult) => {
					if (err) {
						con.close();
						throw err;
					}
					dcase.searchDCase({page:1}, userId, {
						onSuccess: (result: any) => {
							assert.equal(result.dcaseList[0].dcaseId, expectedResult[0].id);
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					});
				});
			});

		});


		describe('getDCase', function() {
			it('should return result', function(done) {
				dcase.getDCase({dcaseId: 201}, userId, {
					onSuccess: (result: any) => {
						// console.log(result);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});
		});

		describe('getNodeTree', function() {
			it('should return result', function(done) {
				dcase.getNodeTree({commitId: 401}, userId, {
					onSuccess: (result: any) => {
						// console.log(result);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});
		});

		describe('getCommitList', function() {
			it('should return result', function(done) {
				dcase.getCommitList({dcaseId: 201}, userId, {
					onSuccess: (result: any) => {
						expect(result.commitList.length > 0).to.be(true);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});
		});

		describe('searchNode', function() {
			it('should return result', function(done) {
				dcase.searchNode({text: 'node402'}, userId, {
					onSuccess: (result: any) => {
						expect(result.searchResultList).to.be.an('array');
						expect(result.searchResultList.length > 0).to.be(true);
						expect(result.searchResultList[0].dcaseId).not.to.be(undefined);
						expect(result.searchResultList[0].nodeId).not.to.be(undefined);
						expect(result.searchResultList[0].dcaseName).not.to.be(undefined);
						expect(result.searchResultList[0].description).not.to.be(undefined);
						expect(result.searchResultList[0].nodeType).not.to.be(undefined);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect(error).to.be(null);},
				});
			});
			it('dcaseList should be limited length', function(done) {
				dcase.searchNode({text: 'node', page:1}, userId, {
					onSuccess: (result: any) => {
						assert.equal(20, result.searchResultList.length);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect(error).to.be(null);},
				});
			});

			it('provides paging feature', function(done) {
				var query = 'node';
				dcase.searchNode({text: query, page:1}, userId, {
					onSuccess: (result: any) => {
						expect(result.summary).not.to.be(undefined);
						expect(result.summary.currentPage).not.to.be(undefined);
						expect(result.summary.maxPage).not.to.be(undefined);
						expect(result.summary.totalItems).not.to.be(undefined);
						expect(result.summary.itemsPerPage).not.to.be(undefined);

						var con = new db.Database();
						con.query('SELECT count(n.id) as cnt FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ?', 
							['%' + query + '%'], (err, expectedResult) => {
							if (err) {
								con.close();
								throw err;
							}
							expect(result.summary.totalItems).to.be(expectedResult[0].cnt);
							done();
						});
					}, 
					onFailure: (error: error.RPCError) => {expect(error).to.be(null);},
				});
			});

			it('can return next page result', function(done) {
				var query = 'node';
				dcase.searchNode({text: query, page:1}, userId, {
					onSuccess: (result1st: any) => {
						dcase.searchNode({text: query, page:2}, userId, {
							onSuccess: (result: any) => {
								expect(result.searchResultList[0]).not.to.eql(result1st.searchResultList[0]);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect(error).to.be(null);},
				});
			});

			it('allow page 0 as 1', function(done) {
				var query = 'node';
				dcase.searchNode({text: query, page:1}, userId, {
					onSuccess: (result1st: any) => {
						dcase.searchNode({text: query, page:0}, userId, {
							onSuccess: (result: any) => {
								expect(result.searchResultList[0]).to.eql(result1st.searchResultList[0]);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect(error).to.be(null);},
				});
			});

			it('allow minus page as 1', function(done) {
				var query = 'node';
				dcase.searchNode({text: query, page:1}, userId, {
					onSuccess: (result1st: any) => {
						dcase.searchNode({text: query, page:-1}, userId, {
							onSuccess: (result: any) => {
								expect(result.searchResultList[0]).to.eql(result1st.searchResultList[0]);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect(error).to.be(null);},
				});
			});

			it('should start from offset 0', function(done) {
				// 最初のクエリとsearchDCaseの実行間にcreateDCaseが走ってエラーになったことがあったかもしれない。
				var query = 'node';
				var con = new db.Database();
				con.query({sql:'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ORDER BY c.modified desc, c.id LIMIT 1', nestTables:true}, 
					['%' + query + '%'], (err, expectedResult) => {
					if (err) {
						con.close();
						throw err;
					}
					dcase.searchNode({text: query, page:1}, userId, {
						onSuccess: (result: any) => {
							expect({
								dcaseId: result.searchResultList[0].dcaseId,
								nodeId: result.searchResultList[0].nodeId
							}).to.eql({
								dcaseId: expectedResult[0].d.id,
								nodeId: expectedResult[0].n.this_node_id
							});
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect(JSON.stringify(error)).to.be(null);},
					});
				});
			});
		});

		// ///////////////////////////////////////////////
		describe('createDCase', function() {
			it('should return result', function(done) {
				dcase.createDCase(
					{
						dcaseName: 'test dcase', 
						contents: {
							NodeCount:3,
							TopGoalId:1,
							NodeList:[
								{
									ThisNodeId:1,
									Description:"dcase1",
									Children:[2],
									NodeType:"Goal"
								},
								{
									ThisNodeId:2,
									Description:"s1",
									Children:[3],
									NodeType:"Strategy"
								},
								{
									ThisNodeId:3,
									Description:"g1",
									Children:[],
									NodeType:"Goal"
								}
							]
						}
					}, userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('UserId not found', function(done) {
				dcase.createDCase(
					{
						dcaseName: 'test dcase', 
						contents: {
							NodeCount:3,
							TopGoalId:1,
							NodeList:[
								{
									ThisNodeId:1,
									Description:"dcase1",
									Children:[2],
									NodeType:"Goal"
								},
								{
									ThisNodeId:2,
									Description:"s1",
									Children:[3],
									NodeType:"Strategy"
								},
								{
									ThisNodeId:3,
									Description:"g1",
									Children:[],
									NodeType:"Goal"
								}
							]
						}
					}, 99999, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.NOT_FOUND);
							expect(err.message).to.be('UserId Not Found.');
							done();
						},
					}
				);
			});
		});

		describe('deleteDCase', function() {
			it('should return result', function(done) {
				dcase.deleteDCase(
					{dcaseId: 201}, 
					userId, 
					{
						onSuccess: (result: any) => {
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('UserId Not Found', function(done) {
				dcase.deleteDCase(
					{dcaseId: 36}, 
					99999, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.NOT_FOUND);
							expect(err.message).to.be('UserId Not Found.');
							done();
						},
					}
				);
			});
		});

		describe('editDCase', function() {
			it('should return result', function(done) {
				dcase.editDCase(
					{dcaseId: 201, dcaseName: 'modified dcase name'}, 
					userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('UserId Not Found', function(done) {
				dcase.editDCase(
					{dcaseId: 201, dcaseName: 'modified dcase name'}, 
					99999, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.NOT_FOUND);
							expect(err.message).to.be('UserId Not Found.');
							done();
						},
					}
				);
			});
		});

		///////////////////////////////////////////////
		describe('commit', function() {
			it('should return result', function(done) {
				this.timeout(15000);
				dcase.commit(
					{
						commitId: 401,
						commitMessage: 'test',
						contents: {
							NodeCount:3,
							TopGoalId:1,
							NodeList:[
								{
									ThisNodeId:1,
									Description:"dcase1",
									Children:[2],
									NodeType:"Goal",
									MetaData: [
										{   
											Type: "Issue",
											Subject: "このゴールを満たす必要がある",
											Description: "詳細な情報をここに記述する",
											Visible: "true",
										},
										{
											Type: "LastUpdated",
											User: "Shida",
											Visible: "false",
										},
									]
								},
								{
									ThisNodeId:2,
									Description:"s1",
									Children:[3],
									NodeType:"Strategy",
									MetaData:[]
								},
								{
									ThisNodeId:3,
									Description:"g1",
									Children:[],
									NodeType:"Goal",
									MetaData: [
										{   
											Type: "Issue",
											Subject: "2つ目のイシュー",
											Description: "あああ詳細な情報をここに記述する",
											Visible: "true"
										},
										{
											Type: "LastUpdated",
											User: "Shida",
											Visible: "false",
										},
									]
								}
							]
						}
					}, 
					userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('should return result', function(done) {
				this.timeout(15000);
				dcase.commit(
					{
						commitId: 401,
						commitMessage: 'test',
						contents: {
							NodeCount:3,
							TopGoalId:1,
							NodeList:[
								{
									ThisNodeId:1,
									Description:"dcase1",
									Children:[2],
									NodeType:"Goal",
									MetaData: [
										{   
											Type: "Issue",
											Subject: "このゴールを満たす必要がある",
											Description: "詳細な情報をここに記述する",
											Visible: "true",
										},
										{
											Type: "LastUpdated",
											User: "Shida",
											Visible: "false",
										},
									]
								},
								{
									ThisNodeId:2,
									Description:"s1",
									Children:[3],
									NodeType:"Strategy",
									MetaData:[]
								},
								{
									ThisNodeId:3,
									Description:"g1",
									Children:[],
									NodeType:"Goal",
									MetaData: [
										{   
											Type: "Issue",
											Subject: "2つ目のイシュー",
											Description: "あああ詳細な情報をここに記述する",
											Visible: "true"
										},
										{
											Type: "LastUpdated",
											User: "Shida",
											Visible: "false",
										},
									]
								}
							]
						}
					}, 
					99999, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.NOT_FOUND);
							expect(err.message).to.be('UserId Not Found.');
							done();
						},
					}
				);
			});
		});
	});
});
