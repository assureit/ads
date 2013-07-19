///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import http = module('http')
import app = module('../../app')
import error = module('../../api/error')
var request = require('supertest');	// TODO: supertestの宣言ファイル作成
var expect = require('expect.js');

describe('routes.api', function() {
	describe('createDCase', function() {
		it('require auth', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"jsonrpc":"2.0", "method":"createDCase", "id":100, "params":{}})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
				});
		});
	});
	describe('commit', function() {
		it('require auth', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"jsonrpc":"2.0", "method":"commit", "id":100, "params":{}})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
				});
		});
	});
	describe('deleteDCase', function() {
		it('require auth', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"jsonrpc":"2.0", "method":"deleteDCase", "id":100, "params":{}})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
				});
		});
	});
	describe('editDCase', function() {
		it('require auth', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"jsonrpc":"2.0", "method":"editDCase", "id":100, "params":{}})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
				});
		});
	});
	describe('uploadFile', function() {
		it('require auth', function() {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/api/1.0')
				.send({"jsonrpc":"2.0", "method":"uploadFile", "id":100, "params":{}})
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.body.error);
					assert.notStrictEqual(undefined, res.body.error.code);
					expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
				});
		});
	});
})
