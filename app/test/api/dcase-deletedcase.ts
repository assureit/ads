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

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function() {
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
		describe('deleteDCase', function() {
			it('should return result', function(done) {
				dcase.deleteDCase(
					{dcaseId: 201}, 
					userId, 
					{
						onSuccess: (result: any) => {
							expect(result).not.to.be(null);
							expect(result).not.to.be(undefined);
							expect(result.dcaseId).not.to.be(null);
							expect(result.dcaseId).not.to.be(undefined);

							var dcaseDAO = new model_dcase.DCaseDAO(con);
							dcaseDAO.get(result.dcaseId, (err:any, resultDCase:model_dcase.DCase) => {
								expect(err).to.be(null);
								expect(resultDCase.deleteFlag).to.equal(true);
								done();
							});
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
							expect(err.code).to.be(error.RPC_ERROR.DATA_NOT_FOUND);
							expect(err.message).to.be('UserId Not Found.');
							done();
						},
					}
				);
			});
			it('prams is null', function(done) {
				dcase.deleteDCase(null, userId, {
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
				dcase.deleteDCase({}, userId, {
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
				dcase.deleteDCase({dcaseId: "a"}, userId, {
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
			it('DCase Id is not found', function(done) {
				dcase.deleteDCase({dcaseId: 999}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.DATA_NOT_FOUND);
						expect(err.message).to.equal('DCase is not found.');
						done();
					},
				});
			});
			it('DCaseID is already deleted.', function(done) {
				dcase.deleteDCase({dcaseId: 223}, userId, {
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
