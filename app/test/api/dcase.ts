///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')
// import expect = module('expect.js')
var expect = require('expect.js');

describe('api', function() {
	describe('dcase', function() {
		describe('getDCaseList', function() {
			it('should return result', function(done) {
				dcase.getDCaseList(null, {
					onSuccess: (result: any) => {
						// console.log(result);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(error);},
				});
			});

			it('allow page 0 as 1', function(done) {
				dcase.getDCaseList({page: 0}, {
					onSuccess: (result: any) => {
						// console.log(result);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(error);},
				});
			});


			it('dcaseList should be limited length', function(done) {
				dcase.getDCaseList({page: 1}, {
					onSuccess: (result: any) => {
						assert.equal(20, result.dcaseList.length);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(error);},
				});
			});

			it('provides paging feature', function(done) {
				dcase.getDCaseList({page:1}, {
					onSuccess: (result: any) => {
						assert.notStrictEqual(result.summary, undefined);
						assert.notStrictEqual(result.summary.currentPage, undefined);
						assert.notStrictEqual(result.summary.maxPage, undefined);
						assert.notStrictEqual(result.summary.totalItems, undefined);
						assert.notStrictEqual(result.summary.itemsPerPage, undefined);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(error);},
				});
			});

			it('provides paging feature', function(done) {
				dcase.getDCaseList({page:1}, {
					onSuccess: (result1st: any) => {
						dcase.getDCaseList({page:2}, {
							onSuccess: (result: any) => {
								assert.notEqual(result1st.summary.dcaseList[0].dcaseId, result.summary.dcaseList[0].dcaseId);
								done();
							}, 
							onFailure: (error: error.RPCError) => {expect().fail(error);},
						});
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(error);},
				});
			});

		});


		describe('getDCase', function() {
			it('should return result', function(done) {
				dcase.getDCase({dcaseId: 50}, {
					onSuccess: (result: any) => {
						// console.log(result);
					}, 
					onFailure: (error: error.RPCError) => {},
				});
				done();
			});
		});

		describe('getNodeTree', function() {
			it('should return result', function(done) {
				dcase.getNodeTree({commitId: 42}, {
					onSuccess: (result: any) => {
						// console.log(result);
					}, 
					onFailure: (error: error.RPCError) => {},
				});
				done();
			});
		});

		describe('getCommitList', function() {
			it('should return result', function(done) {
				dcase.getCommitList({dcaseId: 50}, {
					onSuccess: (result: any) => {
						// console.log(result);
					}, 
					onFailure: (error: error.RPCError) => {},
				});
				done();
			});
		});

		describe('searchDCase', function() {
			it('should return result', function(done) {
				dcase.searchDCase({text: 'dcase1'}, {
					onSuccess: (result: any) => {
						// console.log(result);
					}, 
					onFailure: (error: error.RPCError) => {},
				});
				done();
			});
		});

		///////////////////////////////////////////////
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
					}, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {
							console.log('err');
							console.log(error);
							done();
						},
					}
				);
			});
		});

		describe('deleteDCase', function() {
			it('should return result', function(done) {
				dcase.deleteDCase(
					{dcaseId: 36}, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {
							console.log('err');
							console.log(error);
							done();
						},
					}
				);
			});
		});

		describe('editDCase', function() {
			it('should return result', function(done) {
				dcase.editDCase(
					{dcaseId: 37, dcaseName: 'modified dcase name'}, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {
							console.log('err');
							console.log(error);
							done();
						},
					}
				);
			});
		});

		///////////////////////////////////////////////
		describe('commit', function() {
			it('should return result', function(done) {
				dcase.commit(
					{
						commitId: 12,
						commitMessage: 'test',
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
					}, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {
							console.log('err');
							console.log(error);
							done();
						},
					}
				);
			});
		});
	});
});
