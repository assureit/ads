var db = require('../db/db')
var testdb = require('../db/test-db')
var expect = require('expect.js');
var async = require('async');
function load(filePathList, callback) {
    var con = new db.Database();
    var testDB = new testdb.TestDB(con);
    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        }, 
        function (next) {
            testDB.clearAll(function (err) {
                return next(err);
            });
        }, 
        function (next) {
            testDB.load('test/default-data.yaml', function (err) {
                return next(err);
            });
        }, 
        function (next) {
            con.commit(function (err) {
                return next(err);
            });
        }, 
        function (next) {
            con.close(function (err) {
                return next(err);
            });
        }, 
        
    ], function (err) {
        expect(err).to.be(undefined);
        callback(err);
    });
}
exports.load = load;
function clear(callback) {
    var con = new db.Database();
    var testDB = new testdb.TestDB(con);
    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        }, 
        function (next) {
            testDB.clearAll(function (err) {
                return next(err);
            });
        }, 
        function (next) {
            con.commit(function (err) {
                return next(err);
            });
        }, 
        function (next) {
            con.close(function (err) {
                return next(err);
            });
        }, 
        
    ], function (err) {
        expect(err).to.be(undefined);
        callback(err);
    });
}
exports.clear = clear;
