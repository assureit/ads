
var model_monitor = require('../../model/monitor');

var testdata = require('../testdata');
var expect = require('expect.js');
var async = require('async');
var express = require('express');
var app = express();

var recRequestBody;

app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    recRequestBody = req.body;
    res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: 1 }));
});

describe('model', function () {
    describe('monitor', function () {
        var server = null;
        before(function (done) {
            server = app.listen(3030).on('listening', done);
        });

        after(function () {
            server.close();
        });

        var con;
        var monitorDAO;
        beforeEach(function (done) {
            testdata.begin(['test/default-data.yaml', 'test/model/monitor.yaml'], function (err, c) {
                con = c;
                monitorDAO = new model_monitor.MonitorDAO(con);
                recRequestBody = null;
                done();
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

        describe('listNotPublish', function () {
            it('should not select publish_status 1', function (done) {
                var notPublishedList = [];
                var published = 0;
                async.waterfall([
                    function (next) {
                        monitorDAO.listNotPublished(201, function (err, list) {
                            expect(list).not.to.be(null);
                            expect(list.length > 0).to.equal(true);
                            list.forEach(function (it) {
                                expect(it.id).not.to.equal(published);
                            });
                            next(err);
                        });
                    }
                ], function (err, result) {
                    expect(err).to.be(null);
                    done();
                });
            });
        });

        describe('publish', function () {
            it('should update publish_status to 1', function (done) {
                async.waterfall([
                    function (next) {
                        monitorDAO.publish(201, function (err) {
                            next(err);
                        });
                    },
                    function (next) {
                        monitorDAO.listNotPublished(201, function (err, list) {
                            expect(list).not.to.be(null);
                            expect(list.length).to.equal(0);
                            next(err);
                        });
                    }
                ], function (err, result) {
                    expect(err).to.be(null);
                    done();
                });
            });
            it('rec api registMonitor parameter check', function (done) {
                async.waterfall([
                    function (next) {
                        monitorDAO.publish(202, function (err) {
                            next(err);
                        });
                    },
                    function (next) {
                        monitorDAO.listNotPublished(202, function (err, list) {
                            expect(list).not.to.be(null);
                            expect(list.length).to.equal(0);
                            next(err);
                        });
                    },
                    function (next) {
                        con.query('SELECT * FROM monitor_node WHERE dcase_id = 202', function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor).not.to.be(null);
                            expect(resultMonitor.length).to.eql(1);
                            expect(recRequestBody).not.to.be(null);
                            expect(recRequestBody.method).to.eql('registMonitor');
                            expect(recRequestBody.params.nodeID).to.eql(resultMonitor[0].id);
                            expect(recRequestBody.params.watchID).to.eql(resultMonitor[0].watch_id);
                            expect(recRequestBody.params.presetID).to.eql(resultMonitor[0].preset_id);
                            next(err);
                        });
                    }
                ], function (err, result) {
                    expect(err).to.be(null);
                    done();
                });
            });
            it('rec api updateMonitor parameter check', function (done) {
                async.waterfall([
                    function (next) {
                        monitorDAO.publish(203, function (err) {
                            next(err);
                        });
                    },
                    function (next) {
                        monitorDAO.listNotPublished(203, function (err, list) {
                            expect(list).not.to.be(null);
                            expect(list.length).to.equal(0);
                            next(err);
                        });
                    },
                    function (next) {
                        con.query('SELECT * FROM monitor_node WHERE dcase_id = 203', function (err, resultMonitor) {
                            expect(err).to.be(null);
                            expect(resultMonitor).not.to.be(null);
                            expect(resultMonitor.length).to.eql(1);
                            expect(recRequestBody).not.to.be(null);
                            expect(recRequestBody.method).to.eql('updateMonitor');
                            expect(recRequestBody.params.nodeID).to.eql(resultMonitor[0].id);
                            expect(recRequestBody.params.watchID).to.eql(resultMonitor[0].watch_id);
                            expect(recRequestBody.params.presetID).to.eql(resultMonitor[0].preset_id);
                            next(err);
                        });
                    }
                ], function (err, result) {
                    expect(err).to.be(null);
                    done();
                });
            });
        });
    });
});

