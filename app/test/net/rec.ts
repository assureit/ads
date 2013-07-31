///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import rec = module('../../net/rec')
var expect = require('expect.js');	// TODO: import module化
var express = require('express');
var CONFIG = require('config')
var dSvr = require('../server')

describe('net', () => {
	var server = null;
	before((done) => {
		server = dSvr.app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
	});

	beforeEach((done) => {
		dSvr.setResponseOK(true);
		dSvr.setRecRequestBody(null);
		done();
	});

	describe('rec', () => {
		describe('request', () => {
			it('normal end', function(done) {
				var rc = new rec.Rec();
				rc.request('test_method', {},(err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.jsonrpc).to.eql("2.0");
					expect(result.result).to.be(null);
					expect(result.id).to.eql(1);
					done();
				});
			});
			it('abnormal end', function(done) {
				dSvr.setResponseOK(false);
				var rc = new rec.Rec();
				rc.request('test_method', {},(err:any, result:any) => {
					expect(err).not.to.be(null);
					expect(err.rpcHttpStatus).not.to.be(null);
					expect(err.rpcHttpStatus).not.to.be(undefined);
					expect(err.rpcHttpStatus).to.eql(500);
					done();
				});
			});
			it('request parameter check', function(done) {
				var rc = new rec.Rec();
				rc.request('test_method', {check:'test'},(err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.jsonrpc).to.eql("2.0");
					expect(result.result).to.be(null);
					expect(result.id).to.eql(1);
					expect(dSvr.getRecRequestBody()).not.to.be(null);
					expect(dSvr.getRecRequestBody().method).to.be('test_method');
					expect(dSvr.getRecRequestBody().params.check).to.be('test');
					done();
				});
			});
		});
	});
})
