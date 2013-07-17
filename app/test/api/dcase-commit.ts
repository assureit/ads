///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')
import model_commit = module('../../model/commit')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var userId = constant.SYSTEM_USER_ID;

describe('api', function() {
	var con:db.Database;
	var validParam:any;

	beforeEach(function (done) {
		validParam = {
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
		}

		testdata.load(['test/api/dcase-commit.yaml'], (err:any) => {
	        con = new db.Database();
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});
	describe('dcase', function() {
		///////////////////////////////////////////////
		describe('commit', function() {
			it('should return result', function(done) {
				this.timeout(15000);
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							expect(result).not.to.be(null);
							expect(result).not.to.be(undefined);
							expect(result.commitId).not.to.be(null);
							expect(result.commitId).not.to.be(undefined);
							var commitDAO = new model_commit.CommitDAO(con);
							commitDAO.get(result.commitId, (err:any, resultCommit:model_commit.Commit) => {
								expect(err).to.be(null);
								expect(resultCommit.latestFlag).to.equal(true);
								done();
							});

						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('UserId not found', function(done) {
				this.timeout(15000);
				dcase.commit(validParam, 99999, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.DATA_NOT_FOUND);
							expect(err.message).to.be('UserId Not Found.');
							done();
						},
					}
				);
			});
			it('prams is null', function(done) {
				this.timeout(15000);
				dcase.commit(null, userId, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
							expect(err.message).to.be('Invalid method parameter is found: \nParameter is required.');
							done();
						},
					}
				);
			});
			it('commit id is not set', function(done) {
				this.timeout(15000);
				delete validParam['commitId'];
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
							expect(err.message).to.be('Invalid method parameter is found: \nCommit ID is required.');
							done();
						},
					}
				);
			});
			it('commit id is not a number', function(done) {
				this.timeout(15000);
				validParam.commitId = "a";
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
							expect(err.message).to.be('Invalid method parameter is found: \nCommit ID must be a number.');
							done();
						},
					}
				);
			});
			it('commit message is not set', function(done) {
				this.timeout(15000);
				delete validParam['commitMessage'];	
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
							expect(err.message).to.be('Invalid method parameter is found: \nCommit Message is required.');
							done();
						},
					}
				);
			});
			it('contents is not set', function(done) {
				this.timeout(15000);
				delete validParam['contents'];	
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
							expect(err.message).to.be('Invalid method parameter is found: \nContents is required.');
							done();
						},
					}
				);
			});
			it('Version Conflict', function(done) {
				this.timeout(15000);
				validParam.commitId = 404;	
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							expect(result).to.be(null);	
							done();
						}, 
						onFailure: (err: error.RPCError) => {
							expect(err.rpcHttpStatus).to.be(200);
							expect(err.code).to.be(error.RPC_ERROR.DATA_VERSION_CONFLICT);
							expect(err.message).to.be('CommitID is not the effective newest commitment.');
							done();
						},
					}
				);
			});
		});
	});
});
