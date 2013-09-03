///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import monitor = module('../../api/monitor')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化
var CONFIG = require('config')
var dSvr = require('../server')

var userId = constant.SYSTEM_USER_ID;

// describe('api', function() {
// 	var con:db.Database;
// 	var validParams:any;

// 	beforeEach(function (done) {
// 		testdata.load(['test/default-data.yaml', 'test/api/monitor.yaml'], (err:any) => {
// 		        con = new db.Database();
// 			validParams = {
// 				evidenceId: 1,
// 				systemNodeId:1,
// 				timestamp:'2013-06-26T12:30:30.999Z',
// 				comment:'Unit Test Run',
// 				status:'OK'
// 				}
// 			dSvr.setResponseOK(true);
// 			dSvr.setRedmineRequestBody(null);
// 			dSvr.setRecRequestBody(null);
// 			done();
// 		});
// 	});
// 	afterEach(function (done) {
// 		testdata.clear((err:any) => done());
// 	});
// 	describe('monitor', function() {
// 		var server = null;
// 		before((done) => {
// 			CONFIG.redmine.port = 3030;	
// 			server = dSvr.app.listen(3030).on('listening', done);
// 		});

// 		after(() => {
// 			server.close();
// 			CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
// 			CONFIG.resetRuntime((err, written, buffer) => {}); 
// 		});

// 		// var con = new db.Database();
// 		// con.query('INSERT INTO monitor_node(dcase_id, this_node_id) VALUE (12, 2)', (err, expectedResult) => {
// 		// 	con.close();
// 		// });

// 		describe('modifyMonitorStatus', function() {
// 			it('system node ID not existing is specified ', function(done) {
// 				validParams.systemNodeId = 99999;
// 				validParams.status = 'NG';
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();
// 					}, 
// 					onFailure: (err: any) => {
// 						expect(err).not.to.be(null);
// 						expect(err instanceof error.NotFoundError).to.be(true);
// 						done();
// 					},
// 				});
// 			});
// 			it('status change OK->NG', function(done) {
// 				validParams.systemNodeId = 603;
// 				validParams.status = 'NG';
				
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [validParams.systemNodeId], (err, expectedResult) => {
// 							expect(err).to.be(null);
// 							expect(1).to.be(expectedResult.length);
// 							expect(dSvr.getRedmineRequestBody()).not.to.be(null);
// 							expect(dSvr.getRedmineRequestBody().issue.subject).to.eql(constant.REBUTTAL_SUBJECT);
// 							expect(dSvr.getRedmineRequestBody().issue.description).to.eql(constant.REBUTTAL_DESCRIPTION+ '\r\n' + validParams.comment);
// 							done();
// 						});
// 					}, 
// 					onFailure: (err: any) => {
// 						expect(err).to.be(null);
// 						done();
// 					},
// 				});
// 			});
// 			it('status change NG->OK', function(done) {
// 				validParams.systemNodeId = 1001;
// 				validParams.status = 'OK';
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [validParams.systemNodeId], (err, expectedResult) => {
// 							expect(err).to.be(null);
// 							expect(0).to.be(expectedResult.length);
// 							expect(dSvr.getRedmineRequestBody()).not.to.be(null);
// 							expect(dSvr.getRedmineRequestBody().issue.notes).to.eql(validParams.comment);
// 							done();
// 						});
// 					}, 
// 					onFailure: (err: any) => {
// 						expect(err).to.be(null);
// 						done();
// 					},
// 				});
// 			});
// 			it('prams is null', function(done) {
// 				monitor.modifyMonitorStatus(null, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nParameter is required.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Evidence ID is not set', function(done) {
// 				delete validParams['evidenceId'];
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nEvidence ID is required.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Evidence ID is not a number', function(done) {
// 				validParams.evidenceId = 'a';
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nEvidence ID must be a number.');
// 						done();
// 					},
// 				});
// 			});
// 			it('System Node ID is not set', function(done) {
// 				delete validParams['systemNodeId'];
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nSystem Node ID is required.');
// 						done();
// 					},
// 				});
// 			});
// 			it('System Node ID is not a number', function(done) {
// 				validParams.systemNodeId = 'a';
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nSystem Node ID must be a number.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Timestamp is not set', function(done) {
// 				delete validParams['timestamp'];
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nTimestamp is required.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Comment is not set', function(done) {
// 				delete validParams['comment'];
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nComment is required.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Status is not set', function(done) {
// 				delete validParams['status'];
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nStatus is required.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Status is not OK or NG', function(done) {
// 				validParams.status = 'AA';
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err.rpcHttpStatus).to.be(200);
// 						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
// 						expect(err.message).to.be('Invalid method parameter is found: \nStatus is OK or NG.');
// 						done();
// 					},
// 				});
// 			});
// 			it('Effective Node is Nothing', function(done) {
// 				validParams.systemNodeId = 605;
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err).to.be(null);
// 						done();
// 					},
// 				});
// 			});
// 			it('Effective DCase is Nothing', function(done) {
// 				validParams.systemNodeId = 606;
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();	
// 					},
// 					onFailure: (err: error.RPCError) => {
// 						expect(err).to.be(null);
// 						done();
// 					},
// 				});
// 			});
// 			it('It is not connectable with rec. ', function(done) {
// 				validParams.systemNodeId = 603;
// 				validParams.status = 'NG';
// 				dSvr.setResponseOK(false);
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						done();
// 					}, 
// 					onFailure: (err: error.RPCError) => {
// 						expect(err).not.to.be(null);
// 						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [validParams.systemNodeId], (err, expectedResult) => {
// 							expect(err).to.be(null);
// 							expect(0).to.be(expectedResult.length);
// 							done();
// 						});
// 					},
// 				});
// 			});
// 			it('Since issueId could not be acquired, redmine was not able to be called. ', function(done) {
// 				validParams.systemNodeId = 1002;
// 				validParams.status = 'OK';
// 				monitor.modifyMonitorStatus(validParams, userId, {
// 					onSuccess: (result: any) => {
// 						expect(result).to.be(null);
// 						expect(dSvr.getRedmineRequestBody()).to.be(null);
// 						done();
// 					}, 
// 					onFailure: (err: any) => {
// 						expect(err).to.be(null);
// 						done();
// 					},
// 				});
// 			});
// 		});
// 	});
// });
