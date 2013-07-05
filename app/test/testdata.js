var db = require('../db/db')
var testdb = require('../db/test-db')
var expect = require('expect.js');
var async = require('async');
var _ = require('underscore');
function load(filePathList, callback) {
    var con = new db.Database();
    var testDB = new testdb.TestDB(con);
    async.waterfall([
        function (next) {
            testDB.clearAll(function (err) {
                return next(err);
            });
        }, 
        function (next) {
            testDB.loadAll(buildFilePathList(filePathList), function (err) {
                return next(err);
            });
        }, 
        function (next) {
            con.close(function (err) {
                return next(err);
            });
        }, 
        
    ], function (err) {
        if(err) {
            console.log(err);
        }
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
            testDB.clearAll(function (err) {
                return next(err);
            });
        }, 
        function (next) {
            con.close(function (err) {
                return next(err);
            });
        }, 
        
    ], function (err) {
        if(err) {
            console.log(err);
        }
        expect(err).to.be(undefined);
        callback(err);
    });
}
exports.clear = clear;
function begin(filePathList, callback) {
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
            testDB.loadAll(buildFilePathList(filePathList), function (err) {
                return next(err);
            });
        }, 
        
    ], function (err) {
        if(err) {
            console.log(err);
        }
        expect(err).to.be(null);
        callback(err, con);
    });
}
exports.begin = begin;
function buildFilePathList(filePathList) {
    return _.uniq(_.union([
        'test/default-data.yaml'
    ], filePathList));
}
