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

describe('api', function() {
    var con;
	beforeEach(function (done) {
		testdata.load(['test/default-data.yaml'], (err:any) => {
	        con = new db.Database();
			done();
		});
	});
	afterEach(function (done) {
		var exec = require('child_process').exec;
		exec('chmod 775 upload', function(err, stdout, stderr){
			CONFIG.ads.uploadPath = CONFIG.getOriginalConfig().ads.uploadPath;
			CONFIG.resetRuntime(function(err, written, buffer) {
				testdata.clear((err:any) => done());
			});
		});
	});
	describe('upload', function() {
		it('should return HTTP200 return URL ', function(done) {
			this.timeout(15000);
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.notStrictEqual(undefined, res.text);
					assert.notStrictEqual(null, res.text);
					assert.notEqual('', res.text);
					done();
				});
		});
		it('Upload files have been move or ', function(done) {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					
					var d = new Date();
					var yy: string = String(d.getFullYear());
					var mm: string = String(d.getMonth() + 1);
					var dd: string = String(d.getDate());
					if (mm.length == 1) mm = '0' + mm;
					if (dd.length == 1) dd = '0' + dd;
					var todayDir: string = yy + '/' + mm + '/' + dd;
					var url = res.text.split('=')[1];
					var filename = url.substr(url.lastIndexOf('/'), url.length - url.lastIndexOf('/') );
					assert.equal(true, fs.existsSync('upload/' + todayDir + filename)); 	

					done();
				});
		});
		it('DB.file.path for any updates ', function(done) {
			request(app['app'])	// TODO: 型制約を逃げている。要修正。
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					
					var url = res.text.split('=')[1];
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
						var todayDir: string = yy + '/' + mm + '/' + dd;
						var filename = 'upload/' + todayDir + '/' + fileId;
						assert.equal(expectedResult[0].path, filename); 
						con.close();	
						done();
					});
				});
		});
		it('Upload File Nothing', function(done) {
			request(app['app'])
				.post('/file')
				.expect(400)
				.expect('Upload File not exists.')
				.end(function(err, res) {
					if (err) throw err;
					done();
				});
		});
		it('Config error', function(done) {

			CONFIG.ads.uploadPath = '';
			request(app['app'])
				.post('/file')
				.attach('upfile', 'test/routes/testfiles/uptest.txt')
				.expect(500)
				.expect('The Upload path is not set.')
				.end(function(err, res) {
					if (err) throw err;
					done();
				});
		});
	})
	describe('download', function() {
		it('not exist file', function(done) {
			request(app['app'])
				.get('/file/302')
				.expect(404)
				.expect('File Not Found')
				.end(function (err, res) {
					if (err) throw err;
					done();
				});
		});
		it('not exist DB data', function(done) {
			request(app['app'])
				.get('/file/10000')
				.expect(404)
				.expect('File Not Found')
				.end(function (err, res) {
					if (err) throw err;
					done();
				});
		});
		it('should return name and fileBody', function(done) {
			request(app['app'])
				.get('/file/301')
				.expect(200)
				.end(function (err, res) {
					if (err) throw err;
					assert.equal(res.header['content-type'], 'text/plain; charset=UTF-8');
					assert.equal(res.header['content-disposition'], 'attachment; filename="file1"');
					assert.equal(res.text, 'アップロードテスト用のファイルです\n');
					done();
				});
		});
		it('File ID is not a number', function(done) {
			request(app['app'])
				.get('/file/aaa')
				.expect(400)
				.expect('Id must be a number.')
				.end(function (err, res) {
					if (err) throw err;
					done();
				});
		});

	}) 
})
