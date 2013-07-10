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
	});
});
