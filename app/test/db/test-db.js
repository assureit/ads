
var db = require('../../db/db');
var testdb = require('../../db/test-db');
var expect = require('expect.js');
var async = require('async');

describe('test-db', function () {
    var con;
    var testDB;
    beforeEach(function (done) {
        con = new db.Database();
        con.begin(function (err, result) {
            testDB = new testdb.TestDB(con);
            testDB.clearAll(function (err) {
                done();
            });
        });
    });
    afterEach(function (done) {
        if (con) {
            con.rollback(function (err, result) {
                con.close();
                if (err) {
                    throw err;
                }
                done();
            });
        }
    });
    describe('load', function () {
        it('should load yaml data to database tables', function (done) {
            async.waterfall([
                function (next) {
                    testDB.load('test/default-data.yaml', function (err) {
                        next(err);
                    });
                },
                function (next) {
                    con.query('SELECT count(*) as cnt FROM user WHERE id=101', function (err, result) {
                        expect(result.length).to.equal(1);
                        expect(result[0].cnt).to.equal(1);
                        next(err);
                    });
                }
            ], function (err) {
                expect(err).to.be(null);
                done();
            });
        });
    });

    describe('clearAll', function () {
        it('should clear all database tables', function (done) {
            async.waterfall([
                function (next) {
                    testDB.load('test/default-data.yaml', function (err) {
                        next(err);
                    });
                },
                function (next) {
                    testDB.clearAll(function (err) {
                        expect(err).to.be(null);
                        next(err);
                    });
                },
                function (next) {
                    con.query('SELECT count(*) as cnt FROM user WHERE id=101', function (err, result) {
                        expect(result.length).to.equal(1);
                        expect(result[0].cnt).to.equal(0);
                        next(err);
                    });
                }
            ], function (err) {
                expect(err).to.be(null);
                done();
            });
        });
    });
});

