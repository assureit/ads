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

var app = express();

var responseFlag = true;
var recRequestBody:any;

app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req: any, res: any) {
	res.header('Content-Type', 'application/json');
	recRequestBody = req.body;
	if (responseFlag) {
		res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id:1}));
	} else {
		res.send(JSON.stringify({ jsonrpc: "2.0", id:1}), 500);
	}
});

describe('net', () => {
	var server = null;
	before((done) => {
		server = app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
	});

	describe('rec', () => {
		describe('request', () => {
			it('normal end', function(done) {
				responseFlag = true;
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
				responseFlag = false;
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
				responseFlag = true;
				recRequestBody = null;
				var rc = new rec.Rec();
				rc.request('test_method', {check:'test'},(err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.jsonrpc).to.eql("2.0");
					expect(result.result).to.be(null);
					expect(result.id).to.eql(1);
					expect(recRequestBody).not.to.be(null);
					expect(recRequestBody.method).to.be('test_method');
					expect(recRequestBody.params.check).to.be('test');
					done();
				});
			});
		});
	});
})
