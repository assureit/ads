///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')
import model_dcase = module('../../model/dcase')
import model_commit = module('../../model/commit')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function() {
	var con:db.Database;
	beforeEach(function (done) {
		testdata.load(['test/api/dcase.yaml'], (err:any) => {
	        con = new db.Database();
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});
		describe('getDCase', function() {
			it('should return result', function(done) {
				dcase.getDCase({dcaseId: 201}, userId, {
					onSuccess: (result: any) => {
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result.commitId).not.to.be(null);
						expect(result.commitId).not.to.be(undefined);
						expect(result.dcaseName).not.to.be(null);
						expect(result.dcaseName).not.to.be(undefined);	
						expect(result.contents).not.to.be(null);
						expect(result.contents).not.to.be(undefined);
						var dcaseDAO = new model_dcase.DCaseDAO(con);
						var commitDAO = new model_commit.CommitDAO(con);
						commitDAO.get(result.commitId, (err:any, resultCommit:model_commit.Commit) => {
							expect(err).to.be(null);
							expect(resultCommit.latestFlag).to.equal(true);
							dcaseDAO.get(resultCommit.dcaseId, (err:any, resultDCase:model_dcase.DCase) => {
								expect(err).to.be(null);
								expect(resultDCase.name).to.equal(result.dcaseName);
								expect(resultDCase.deleteFlag).to.equal(false);
								done();
							});
						});
					}, 
					onFailure: (err: error.RPCError) => {
						expect().fail(JSON.stringify(err));
						done();
					},
				});
			});
			it('prams is null', function(done) {
				dcase.getDCase(null, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.equal('Invalid method parameter is found: \nParameter is required.');
						done();
					},
				});
			});
			it('DCase Id is not set', function(done) {
				dcase.getDCase({}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.equal('Invalid method parameter is found: \nDCase ID is required.');
						done();
					},
				});
			});
			it('DCase Id is not a number', function(done) {
				dcase.getDCase({dcaseId: "a"}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.equal('Invalid method parameter is found: \nDCase ID must be a number.');
						done();
					},
				});
			});
			it('DCase is not found', function(done) {
				dcase.getDCase({dcaseId: 999}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.DATA_NOT_FOUND);
						expect(err.message).to.equal('Effective DCase does not exist.');
						done();
					},
				});
			});
		});
});
