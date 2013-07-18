
var testdata = require('../testdata')
var db = require('../../db/db')
var model_monitor = require('../../model/monitor')
var expect = require('expect.js');
var exec = require('child_process').exec;
var express = require('express');
var app = express();
var responseFlag = true;
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    if(responseFlag) {
        res.send(JSON.stringify({
            jsonrpc: "2.0",
            result: null,
            id: 1
        }));
    } else {
        res.send(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: 100,
                message: 'error'
            },
            id: 1
        }), 500);
    }
});
describe('job', function () {
    var con = null;
    var server = null;
    var cmd = 'npm run-script clean_monitor';
    before(function (done) {
        server = app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
        testdata.clear(function (err) {
        });
    });
    beforeEach(function (done) {
        testdata.load([
            'test/default-data.yaml'
        ], function (err) {
            con = new db.Database();
            done();
        });
    });
    describe('monitor', function () {
        describe('cleanMonitor', function () {
            it('Run all skip', function (done) {
                testdata.load([
                    'test/default-data.yaml'
                ], function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        done();
                    });
                });
            });
            it('DCase is already delete', function (done) {
                testdata.load([
                    'test/job/monitor01.yaml'
                ], function (err) {
                    responseFlag = true;
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        var monitor = new model_monitor.MonitorDAO(con);
                        monitor.get(604, function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor.deleteFlag).to.be(true);
                            done();
                        });
                    });
                });
            });
            it('Not Found Lastest Commit', function (done) {
                testdata.load([
                    'test/job/monitor02.yaml'
                ], function (err) {
                    responseFlag = true;
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        var monitor = new model_monitor.MonitorDAO(con);
                        monitor.get(605, function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor.deleteFlag).to.be(true);
                            done();
                        });
                    });
                });
            });
            it('Not Found Node', function (done) {
                testdata.load([
                    'test/job/monitor03.yaml'
                ], function (err) {
                    responseFlag = true;
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        var monitor = new model_monitor.MonitorDAO(con);
                        monitor.get(606, function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor.deleteFlag).to.be(true);
                            done();
                        });
                    });
                });
            });
            it('Not Found MonitorNode', function (done) {
                responseFlag = true;
                testdata.clear(function (err) {
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).to.be(null);
                        done();
                    });
                });
            });
            it('Rec Response Error', function (done) {
                testdata.load([
                    'test/job/monitor03.yaml'
                ], function (err) {
                    responseFlag = false;
                    exec(cmd, function (err, stdout, stderr) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });
            });
        });
    });
});
