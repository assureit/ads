///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import http = module('http')
import app = module('../../app')
import fs = module('fs')
import db = module('../../db/db')
// import testdb = module('../../db/test-db')
import testdata = module('../testdata')
var request = require('supertest');	// TODO: supertestの宣言ファイル作成
var async = require('async')
var CONFIG = require('config')
import error = module('../../api/error')

describe('route', function() {
    var con;
	afterEach(function (done) {
		CONFIG.rec.monitorUrl = CONFIG.getOriginalConfig().rec.monitorUrl;
		CONFIG.resetRuntime(function(err, written, buffer) {
			done();
		});
	});
	describe('monitor', function() {
		it('should return HTTP200 return URL ', function(done) {
			this.timeout(15000);
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.get('/monitor/55')
				.expect(302)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.text);
					assert.notStrictEqual(null, res.text);
					assert.notEqual('', res.text);
					done();
				});
		});
		it('Config error', function(done) {

			CONFIG.rec.monitorUrl = '';
			request(app['app'])
				.get('/monitor/55')
				.expect(500)
				.expect('rec.monitorUrl is not set.')
				.end(function(err, res) {
					if (err) throw err;
					done();
				});
		});
		it('ID is not a number', function(done) {
			request(app['app'])
				.get('/monitor/aaa')
				.expect(400)
				.expect('Id must be a number.')
				.end(function (err, res) {
					if (err) throw err;
					done();
				});
		});

	}) 
})
