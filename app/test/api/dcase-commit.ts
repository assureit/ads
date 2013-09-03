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
var dSvr = require('../server')

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function() {
	var con:db.Database;
	var validParam:any;

	beforeEach(function (done) {
		validParam = {
			commitId: 401,
			commitMessage: 'test',
			contents: '*1\n' +
						'dcase1\n' +
						'Note0::\n' +
						'	Type: Issue\n' +
						'	Subject: このゴールを満たす必要がある\n' +
						'	Visible: true\n' +
						'	詳細な情報をここに記述する\n' +
						'Note1::\n' +
						'	Type: LastUpdated\n' +
						'	User: Shida\n' +
						'	Visible: false\n' +
						'Note2::\n' +
						'	Type: Tag\n' +
						'	Tag: tag1\n' +
						'	Visible: true\n' +
						'*2\n' +
						's1\n' +
						'**3\n' +
						'g1\n' +
						'Note0::\n' +
						'	Type: Issue\n' +
						'	Subject: 2つ目のイシュー\n' +
						'	Visible: true\n' +
						'	あああ詳細な情報をここに記述する\n' +
						'Note1::\n' +
						'	Type: LastUpdated\n' +
						'	User: Shida\n' +
						'	Visible: false\n' +
						'Note2::\n' +
						'	Type: Tag\n' +
						'	Tag: tag1\n' +
						'	Visible: true\n' +
						'Note3::\n' +
						'	Type: Tag\n' +
						'	Tag: tag2\n' +
						'	Visible: true\n' +
						'Note4::\n' +
						'	Type: Tag\n' +
						'	Tag: newTag\n' +
						'	Visible: true'
		}
		testdata.load(['test/api/dcase-commit.yaml'], (err:any) => {
		        con = new db.Database();
			dSvr.setResponseOK(true);
			dSvr.setRecRequestBody(null);
			dSvr.setRedmineRequestBody(null);
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});

	var server = null;
	before((done) => {
		CONFIG.redmine.port = 3030;
		server = dSvr.app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
		CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
		CONFIG.resetRuntime((err, written, buffer) => {});
	});

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
			// it('rec api registMonitor parameter check', function(done) {
			// 	this.timeout(15000);
			// 	validParam.commitId = 406;
			// 	dcase.commit(validParam, userId, 
			// 		{
			// 			onSuccess: (result: any) => {
			// 				// console.log(result);
			// 				expect(result).not.to.be(null);
			// 				expect(result).not.to.be(undefined);
			// 				expect(result.commitId).not.to.be(null);
			// 				expect(result.commitId).not.to.be(undefined);
			// 				var commitDAO = new model_commit.CommitDAO(con);
			// 				commitDAO.get(result.commitId, (err:any, resultCommit:model_commit.Commit) => {
			// 					expect(err).to.be(null);
			// 					expect(resultCommit.latestFlag).to.equal(true);
			// 					con.query('SELECT * FROM monitor_node WHERE dcase_id = ?', [resultCommit.dcaseId], (errMonitor:any, resultMonitor:any) => {
			// 						expect(errMonitor).to.be(null);
			// 						expect(resultMonitor).not.to.be(null);
			// 						expect(resultMonitor.length).to.eql(1);
			// 						expect(dSvr.getRecRequestBody()).not.to.be(null);
			// 						expect(dSvr.getRecRequestBody().method).to.eql('registMonitor');
			// 						expect(dSvr.getRecRequestBody().params.nodeID).to.eql(resultMonitor[0].id);
			// 						expect(dSvr.getRecRequestBody().params.watchID).to.eql(resultMonitor[0].watch_id);
			// 						expect(dSvr.getRecRequestBody().params.presetID).to.eql(resultMonitor[0].preset_id);
			// 						done();
			// 					});
			// 				});

			// 			}, 
			// 			onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
			// 		}
			// 	);
			// });
			// it('rec api updateMonitor parameter check', function(done) {
			// 	this.timeout(15000);
			// 	validParam.commitId = 407;
			// 	dcase.commit(validParam, userId, 
			// 		{
			// 			onSuccess: (result: any) => {
			// 				// console.log(result);
			// 				expect(result).not.to.be(null);
			// 				expect(result).not.to.be(undefined);
			// 				expect(result.commitId).not.to.be(null);
			// 				expect(result.commitId).not.to.be(undefined);
			// 				var commitDAO = new model_commit.CommitDAO(con);
			// 				commitDAO.get(result.commitId, (err:any, resultCommit:model_commit.Commit) => {
			// 					expect(err).to.be(null);
			// 					expect(resultCommit.latestFlag).to.equal(true);
			// 					con.query('SELECT * FROM monitor_node WHERE dcase_id = ?', [resultCommit.dcaseId], (errMonitor:any, resultMonitor:any) => {
			// 						expect(errMonitor).to.be(null);
			// 						expect(resultMonitor).not.to.be(null);
			// 						expect(resultMonitor.length).to.eql(1);
			// 						expect(dSvr.getRecRequestBody()).not.to.be(null);
			// 						expect(dSvr.getRecRequestBody().method).to.eql('updateMonitor');
			// 						expect(dSvr.getRecRequestBody().params.nodeID).to.eql(resultMonitor[0].id);
			// 						expect(dSvr.getRecRequestBody().params.watchID).to.eql(resultMonitor[0].watch_id);
			// 						expect(dSvr.getRecRequestBody().params.presetID).to.eql(resultMonitor[0].preset_id);
			// 						done();
			// 					});
			// 				});

			// 			}, 
			// 			onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
			// 		}
			// 	);
			// });
			// it('redmine parameter check', function(done) {
			// 	this.timeout(15000);
			// 	validParam.contents.NodeList[2].MetaData = [];
			// 	dcase.commit(validParam, userId, 
			// 		{
			// 			onSuccess: (result: any) => {
			// 				// console.log(result);
			// 				expect(result).not.to.be(null);
			// 				expect(result).not.to.be(undefined);
			// 				expect(result.commitId).not.to.be(null);
			// 				expect(result.commitId).not.to.be(undefined);
			// 				expect(dSvr.getRedmineRequestBody()).not.to.be(null);
			// 				expect(dSvr.getRedmineRequestBody().issue.subject).to.eql(validParam.contents.NodeList[0].MetaData[0].Subject);
			// 				expect(dSvr.getRedmineRequestBody().issue.description).to.eql(validParam.contents.NodeList[0].MetaData[0].Description);
			// 				var commitDAO = new model_commit.CommitDAO(con);
			// 				commitDAO.get(result.commitId, (err:any, resultCommit:model_commit.Commit) => {
			// 					expect(err).to.be(null);
			// 					expect(resultCommit.latestFlag).to.equal(true);
			// 					done();
			// 				});

			// 			}, 
			// 			onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
			// 		}
			// 	);
			// });
		});
});
