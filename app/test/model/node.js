
var model_node = require('../../model/node');
var model_monitor = require('../../model/monitor');

var testdata = require('../testdata');
var expect = require('expect.js');
var async = require('async');

describe('model', function () {
    var testDB;
    var con;
    var nodeDAO;
    var monitorDAO;
    beforeEach(function (done) {
        testdata.begin([], function (err, c) {
            con = c;
            nodeDAO = new model_node.NodeDAO(con);
            monitorDAO = new model_monitor.MonitorDAO(con);
            done();
        });
    });
    afterEach(function (done) {
        con.rollback(function (err, result) {
            con.close();
            if (err) {
                throw err;
            }
            done();
        });
    });
    describe('node', function () {
        describe('process', function () {
        });
    });
});

