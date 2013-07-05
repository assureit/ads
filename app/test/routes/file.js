var assert = require('assert')

var app = require('../../app')
var fs = require('fs')
var db = require('../../db/db')
var testdb = require('../../db/test-db')
var request = require('supertest');
var async = require('async');
describe('api', function () {
    var con;
    var testDB;
    beforeEach(function (done) {
        con = new db.Database();
        testDB = new testdb.TestDB(con);
        async.waterfall([
            function (next) {
                con.begin(function (err, result) {
                    return next(err);
                });
            }, 
            function (next) {
                testDB.load('test/default-data.yaml', function (err) {
                    next(err);
                });
            }, 
            function (next) {
                con.commit(function (err, result) {
                    return next(err);
                });
            }, 
            
        ], function (err) {
            done();
        });
    });
    afterEach(function (done) {
        if(con) {
            con.rollback(function (err, result) {
                con.close();
                if(err) {
                    throw err;
                }
                done();
            });
        }
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
    });
    describe('download', function () {
        it('not exist file', function (done) {
            request(app['app']).get('/file/302').expect(404).end(function (err, res) {
                done();
            });
        });
        it('not exist DB data', function (done) {
            request(app['app']).get('/file/10000').expect(200).end(function (err, res) {
                assert.equal(res.body.rpcHttpStatus, 200);
                assert.equal(res.body.code, 19999);
                done();
            });
        });
        it('should return name and fileBody', function (done) {
            request(app['app']).get('/file/301').expect(200).end(function (err, res) {
                assert.equal(res.header['content-type'], 'text/plain; charset=UTF-8');
                assert.equal(res.header['content-disposition'], 'attachment; filename="file1"');
                assert.equal(res.text, 'アップロードテスト用のファイルです\n');
                done();
            });
        });
    });
});
