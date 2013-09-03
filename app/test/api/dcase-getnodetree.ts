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
		describe('getNodeTree', function() {
			it('should return result', function(done) {
				dcase.getNodeTree({commitId: 401}, userId, {
					onSuccess: (result: any) => {
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result.contents).not.to.be(null);
						expect(result.contents).not.to.be(undefined);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});
			it('prams is null', function(done) {
				dcase.getNodeTree(null, userId, {
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
			it('Commit ID is not set', function(done) {
				dcase.getNodeTree({}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.equal('Invalid method parameter is found: \nCommit ID is required.');
						done();
					},
				});
			});
			it('Commit ID is not a number', function(done) {
				dcase.getNodeTree({commitId: "a"}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.equal('Invalid method parameter is found: \nCommit ID must be a number.');
						done();
					},
				});
			});
			it('Commit is not found', function(done) {
				dcase.getNodeTree({commitId: 99999}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.DATA_NOT_FOUND);
						expect(err.message).to.equal('Effective Commit does not exist.');
						done();
					},
				});
			});
		});
});
