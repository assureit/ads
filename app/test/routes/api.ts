///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import http = module('http')
import app = module('../../app')
var request = require('supertest');	// TODO: supertestの宣言ファイル作成

describe('api', function() {
	describe('jsonrpc', function() {
		it('should return HTTP400 and -32600 when JSON RPC version is invalid or missing', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"jsonrpc":"1.0", "method":"test", "id":100, "params":{"hoge":"hogev"}})
				.expect(400)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(100, res.body.id);
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					assert.equal(-32600, res.body.error.code);
				});
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"method":"test", "id":100, "params":{"hoge":"hogev"}})
				.expect(400)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(100, res.body.id);
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					assert.equal(-32600, res.body.error.code);
				});
		});
		it('should return content-type application/json', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({jsonrpc:"2.0", method:"test", id:100})
				.expect('content-type', 'application/json')
				.end(function (err, res) {
					if (err) throw err;
				});
		});
		it('should return HTTP404 and -32601 when JSON RPC Method is not found', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({jsonrpc:"2.0", id:100})
				.expect(404)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(100, res.body.id);
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					assert.equal(-32601, res.body.error.code);
				});
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({jsonrpc:"2.0", method:"invalidMethod", id:100})
				.expect(404)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(100, res.body.id);
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					assert.equal(-32601, res.body.error.code);
				});
		});
		it('should return HTTP200 and response object when it succeeded', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({jsonrpc:"2.0", method:"ping", id:100})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(100, res.body.id);
					assert.strictEqual(null, res.body.error);
					assert.notStrictEqual(undefined, res.body.result);
					assert.equal('ok', res.body.result);
				});
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0/')
				.send({jsonrpc:"2.0", method:"ping", id:100})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(100, res.body.id);
					assert.strictEqual(null, res.body.error);
					assert.notStrictEqual(undefined, res.body.result);
					assert.equal('ok', res.body.result);
				});
		});
	})
})