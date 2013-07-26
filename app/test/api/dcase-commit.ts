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
var CONFIG = require('config')
// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化
var _ = require('underscore');

var recRequestBody:any;
var redmineRequestBody:any;

var userId = constant.SYSTEM_USER_ID;
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req: any, res: any) {
	res.header('Content-Type', 'application/json');
	recRequestBody = req.body;
	res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id:1}));
});
app.post('/issues.json', function (req: any, res: any) {
	res.header('Content-Type', 'application/json');
	redmineRequestBody = req.body;
	res.send(JSON.stringify({"issue":{"id":3825}}));
});
app.put('/issues/:itsId', function(req: any, res:any) {
	redmineRequestBody = req.body;
	res.send(200);
});


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
							{
								Type: "Tag",
								Tag: "tag1",
								Visible: "true",
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
							{
								Type: "Tag",
								Tag: "tag1",
								Visible: "true",
							},
							{
								Type: "Tag",
								Tag: "tag2",
								Visible: "true",
							},
							{
								Type: "Tag",
								Tag: "newTag",
								Visible: "true",
							},
						]
					}
				]
			}
		}

		testdata.load(['test/api/dcase-commit.yaml'], (err:any) => {
		        con = new db.Database();
			recRequestBody = null;
			redmineRequestBody = null;
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});

	var server = null;
	before((done) => {
		CONFIG.redmine.port = 3030;
		server = app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
		CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
		CONFIG.resetRuntime((err, written, buffer) => {});
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
			it('should atache tags', function(done) {
				this.timeout(15000);
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							expect(result).not.to.be(null);
							expect(result).not.to.be(undefined);
							expect(result.commitId).not.to.be(null);
							expect(result.commitId).not.to.be(undefined);
							con.query('SELECT t.* FROM tag t, dcase_tag_rel r WHERE t.id = r.tag_id AND r.dcase_id=? ORDER BY t.label', [201], (err:any, result:any)=> {
								var resultTags = _.map(result, (it:any) => {return it.label;});
								var expectTags = ['newTag', 'tag1', 'tag2'];
								expect(expectTags).to.eql(resultTags);
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
			// it('commit message is not set', function(done) {
			// 	this.timeout(15000);
			// 	delete validParam['commitMessage'];	
			// 	dcase.commit(validParam, userId, 
			// 		{
			// 			onSuccess: (result: any) => {
			// 				expect(result).to.be(null);	
			// 				done();
			// 			}, 
			// 			onFailure: (err: error.RPCError) => {
			// 				expect(err.rpcHttpStatus).to.be(200);
			// 				expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
			// 				expect(err.message).to.be('Invalid method parameter is found: \nCommit Message is required.');
			// 				done();
			// 			},
			// 		}
			// 	);
			// });
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
			it('rec api registMonitor parameter check', function(done) {
				this.timeout(15000);
				validParam.commitId = 406;
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
								con.query('SELECT * FROM monitor_node WHERE dcase_id = ?', [resultCommit.dcaseId], (errMonitor:any, resultMonitor:any) => {
									expect(errMonitor).to.be(null);
									expect(resultMonitor).not.to.be(null);
									expect(resultMonitor.length).to.eql(1);
									expect(recRequestBody).not.to.be(null);
									expect(recRequestBody.method).to.eql('registMonitor');
									expect(recRequestBody.params.nodeID).to.eql(resultMonitor[0].id);
									expect(recRequestBody.params.watchID).to.eql(resultMonitor[0].watch_id);
									expect(recRequestBody.params.presetID).to.eql(resultMonitor[0].preset_id);
									done();
								});
							});

						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('rec api updateMonitor parameter check', function(done) {
				this.timeout(15000);
				validParam.commitId = 407;
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
								con.query('SELECT * FROM monitor_node WHERE dcase_id = ?', [resultCommit.dcaseId], (errMonitor:any, resultMonitor:any) => {
									expect(errMonitor).to.be(null);
									expect(resultMonitor).not.to.be(null);
									expect(resultMonitor.length).to.eql(1);
									expect(recRequestBody).not.to.be(null);
									expect(recRequestBody.method).to.eql('updateMonitor');
									expect(recRequestBody.params.nodeID).to.eql(resultMonitor[0].id);
									expect(recRequestBody.params.watchID).to.eql(resultMonitor[0].watch_id);
									expect(recRequestBody.params.presetID).to.eql(resultMonitor[0].preset_id);
									done();
								});
							});

						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
					}
				);
			});
			it('redmine parameter check', function(done) {
				this.timeout(15000);
				validParam.contents.NodeList[2].MetaData = [];
				dcase.commit(validParam, userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							expect(result).not.to.be(null);
							expect(result).not.to.be(undefined);
							expect(result.commitId).not.to.be(null);
							expect(result.commitId).not.to.be(undefined);
							expect(redmineRequestBody).not.to.be(null);
							expect(redmineRequestBody.issue.subject).to.eql(validParam.contents.NodeList[0].MetaData[0].Subject);
							expect(redmineRequestBody.issue.description).to.eql(validParam.contents.NodeList[0].MetaData[0].Description);
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
		});
	});
});
