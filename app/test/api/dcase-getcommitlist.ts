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
		describe('getCommitList', function() {
			it('should return result', function(done) {
				dcase.getCommitList({dcaseId: 201}, userId, {
					onSuccess: (result: any) => {
						expect(result.commitList.length > 0).to.be(true);
						done();
					}, 
					onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));},
				});
			});
			it('prams is null', function(done) {
				dcase.getCommitList(null, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);;
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
				dcase.getCommitList({}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);;
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
				dcase.getCommitList({dcaseId: "a"}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);;
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
				dcase.getCommitList({dcaseId: 99999}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);;
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.equal(error.RPC_ERROR.NOT_FOUND);
						expect(err.message).to.equal('Effective DCase does not exist.');
						done();
					}, 
				});
			});
		});
	});
});
