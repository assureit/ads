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
	});
});
