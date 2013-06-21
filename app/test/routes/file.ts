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
var request = require('supertest');	// TODO: supertestの宣言ファイル作成

describe('api', function() {
	describe('upload', function() {
		it('should return HTTP200 return URL ', function(done) {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.body.URL);
					done();
				});
		});
		it('Upload files have been move or ', function(done) {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.end(function (err, res) {
					if (err) throw err;
					
					var d = new Date();
					var yy: string = String(d.getFullYear());
					var mm: string = String(d.getMonth() + 1);
					var dd: string = String(d.getDate());
					if (mm.length == 1) mm = '0' + mm;
					if (dd.length == 1) dd = '0' + dd;
					var todayDir: string = yy + mm + dd;
					var url = res.body.URL;
					var filename = url.substr(url.lastIndexOf('/'), url.length - url.lastIndexOf('/') );
					assert.equal(true, fs.existsSync('upload/' + todayDir + filename)); 	

					done();
				});
		});
		it('DB.file.path for any updates ', function(done) {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.end(function (err, res) {
					if (err) throw err;
					
					var url = res.body.URL;
					var fileId: number = url.substr(url.lastIndexOf('/') + 1, url.length - url.lastIndexOf('/'));
					var con = new db.Database();	
					con.query('select path from file where id = ?', [fileId], (err, expectedResult) => {
						if (err) {
							con.close();
							throw err;
						}

						var d = new Date();
						var yy: string = String(d.getFullYear());
						var mm: string = String(d.getMonth() + 1);
						var dd: string = String(d.getDate());
						if (mm.length == 1) mm = '0' + mm;
						if (dd.length == 1) dd = '0' + dd;
						var todayDir: string = yy + mm + dd;
						var url = res.body.URL;
						var filename = 'upload/' + todayDir + '/' + fileId;
						assert.equal(expectedResult[0].path, filename); 
						con.close();	
						done();
					});
				});
		});

	})
})
