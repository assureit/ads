var assert = require('assert')

var app = require('../../app')
var fs = require('fs')
var db = require('../../db/db')
var testdata = require('../testdata')
var request = require('supertest');
var async = require('async');
var CONFIG = require('config');

describe('api', function () {
    var con;
    beforeEach(function (done) {
        testdata.load([
            'test/default-data.yaml'
        ], function (err) {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        var exec = require('child_process').exec;
        exec('chmod 775 upload', function (err, stdout, stderr) {
            CONFIG.ads.uploadPath = CONFIG.getOriginalConfig().ads.uploadPath;
            CONFIG.resetRuntime(function (err, written, buffer) {
                testdata.clear(function (err) {
                    return done();
                });
            });
        });
    });
    describe('upload', function () {
        it('should return HTTP200 return URL ', function (done) {
            this.timeout(15000);
            request(app['app']).post('/file').attach('upfile', 'test/routes/testfiles/uptest.txt').expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.notStrictEqual(undefined, res.text);
                assert.notStrictEqual(null, res.text);
                assert.notEqual('', res.text);
                done();
            });
        });
        it('Upload files have been move or ', function (done) {
            request(app['app']).post('/file').attach('upfile', 'test/routes/testfiles/uptest.txt').end(function (err, res) {
                if(err) {
                    throw err;
                }
                var d = new Date();
                var yy = String(d.getFullYear());
                var mm = String(d.getMonth() + 1);
                var dd = String(d.getDate());
                if(mm.length == 1) {
                    mm = '0' + mm;
                }
                if(dd.length == 1) {
                    dd = '0' + dd;
                }
                var todayDir = yy + '/' + mm + '/' + dd;
                var url = res.text.split('=')[1];
                var filename = url.substr(url.lastIndexOf('/'), url.length - url.lastIndexOf('/'));
                assert.equal(true, fs.existsSync('upload/' + todayDir + filename));
                done();
            });
        });
        it('DB.file.path for any updates ', function (done) {
            request(app['app']).post('/file').attach('upfile', 'test/routes/testfiles/uptest.txt').end(function (err, res) {
                if(err) {
                    throw err;
                }
                var url = res.text.split('=')[1];
                var fileId = url.substr(url.lastIndexOf('/') + 1, url.length - url.lastIndexOf('/'));
                var con = new db.Database();
                con.query('select path from file where id = ?', [
                    fileId
                ], function (err, expectedResult) {
                    if(err) {
                        con.close();
                        throw err;
                    }
                    var d = new Date();
                    var yy = String(d.getFullYear());
                    var mm = String(d.getMonth() + 1);
                    var dd = String(d.getDate());
                    if(mm.length == 1) {
                        mm = '0' + mm;
                    }
                    if(dd.length == 1) {
                        dd = '0' + dd;
                    }
                    var todayDir = yy + '/' + mm + '/' + dd;
                    var filename = 'upload/' + todayDir + '/' + fileId;
                    assert.equal(expectedResult[0].path, filename);
                    con.close();
                    done();
                });
            });
        });
        it('Upload File Nothing', function (done) {
            request(app['app']).post('/file').expect(400).expect('Upload File not exists.').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
        it('Config error', function (done) {
            CONFIG.ads.uploadPath = '';
            request(app['app']).post('/file').attach('upfile', 'test/routes/testfiles/uptest.txt').expect(500).expect('The Upload path is not set.').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
    });
    describe('download', function () {
        it('not exist file', function (done) {
            request(app['app']).get('/file/302').expect(404).expect('File Not Found').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
        it('not exist DB data', function (done) {
            request(app['app']).get('/file/10000').expect(404).expect('File Not Found').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
        it('should return name and fileBody', function (done) {
            request(app['app']).get('/file/301').expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(res.header['content-type'], 'text/plain; charset=UTF-8');
                assert.equal(res.header['content-disposition'], 'attachment; filename="file1"');
                assert.equal(res.text, 'アップロードテスト用のファイルです\n');
                done();
            });
        });
        it('File ID is not a number', function (done) {
            request(app['app']).get('/file/aaa').expect(400).expect('Id must be a number.').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
    });
});
