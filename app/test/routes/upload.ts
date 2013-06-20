///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import http = module('http')
import app = module('../../app')
import fs = module('fs')
var request = require('supertest');	// TODO: supertestの宣言ファイル作成

describe('api', function() {
	describe('upload', function() {
		it('should return check', function() {
			var filename = 'uptest.txt';
			var boundary = Math.random();

			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/upload')
				.attach('upfile', 'test/routes/originfiles/uptest.txt')
				.end(function (err, res) {
					if (err) throw err;
					console.log('------------------------------');

				});
		});
	})
})
