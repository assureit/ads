
var testdata = require('../testdata');
var db = require('../../db/db');
var model_monitor = require('../../model/monitor');

var expect = require('expect.js');
var exec = require('child_process').exec;
var dSvr = require('../server');

describe('job', function () {
    var con = null;
    var server = null;
    var cmd = 'npm run-script clean_monitor';

    before(function (done) {
        server = dSvr.app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
        testdata.clear(function (err) {
        });
    });

    beforeEach(function (done) {
        testdata.load(['test/default-data.yaml'], function (err) {
            con = new db.Database();
            dSvr.setRecRequestBody(null);
            dSvr.setResponseOK(true);
            done();
        });
    });

    describe('monitor', function () {
        describe('cleanMonitor', function () {
            it('Run all skip', function (done) {
                testdata.load(['test/default-data.yaml'], function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        done();
                    });
                });
            });
            it('DCase is already delete', function (done) {
                testdata.load(['test/job/monitor01.yaml'], function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        var monitor = new model_monitor.MonitorDAO(con);
                        monitor.get(604, function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor.deleteFlag).to.be(true);
                            expect(dSvr.getRecRequestBody()).not.to.be(null);
                            expect(dSvr.getRecRequestBody().method).to.be('deleteMonitor');
                            expect(dSvr.getRecRequestBody().params.nodeID).to.be(604);
                            done();
                        });
                    });
                });
            });
            it('Not Found Lastest Commit', function (done) {
                testdata.load(['test/job/monitor02.yaml'], function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        var monitor = new model_monitor.MonitorDAO(con);
                        monitor.get(605, function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor.deleteFlag).to.be(true);
                            expect(dSvr.getRecRequestBody()).not.to.be(null);
                            expect(dSvr.getRecRequestBody().method).to.be('deleteMonitor');
                            expect(dSvr.getRecRequestBody().params.nodeID).to.be(605);
                            done();
                        });
                    });
                });
            });
            it('Not Found Node', function (done) {
                testdata.load(['test/job/monitor03.yaml'], function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        var monitor = new model_monitor.MonitorDAO(con);
                        monitor.get(606, function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor.deleteFlag).to.be(true);
                            expect(dSvr.getRecRequestBody()).not.to.be(null);
                            expect(dSvr.getRecRequestBody().method).to.be('deleteMonitor');
                            expect(dSvr.getRecRequestBody().params.nodeID).to.be(606);
                            done();
                        });
                    });
                });
            });
            it('Not Found MonitorNode', function (done) {
                testdata.clear(function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        done();
                    });
                });
            });
            it('Rec Response Error', function (done) {
                testdata.load(['test/job/monitor03.yaml'], function (err) {
                    dSvr.setResponseOK(false);
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });
            });
        });
    });
});

