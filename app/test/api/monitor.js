
var db = require('../../db/db')
var monitor = require('../../api/monitor')
var error = require('../../api/error')
var constant = require('../../constant')
var testdata = require('../testdata')
var expect = require('expect.js');
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send(req.body);
});
var userId = constant.SYSTEM_USER_ID;
describe('api', function () {
    var con;
    beforeEach(function (done) {
        testdata.load([
            'test/default-data.yaml', 
            'test/api/monitor.yaml'
        ], function (err) {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('monitor', function () {
        var server = null;
        before(function (done) {
            server = app.listen(3030).on('listening', done);
        });
        after(function () {
            server.close();
        });
        describe('modifyMonitorStatus', function () {
            it('system node ID not existing is specified ', function (done) {
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: 99999,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'NG'
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).not.to.be(null);
                        expect(err instanceof error.NotFoundError).to.be(true);
                        done();
                    }
                });
            });
            it('status change OK->NG', function (done) {
                var monitorId = 603;
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: monitorId,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'NG'
                }, userId, {
                    onSuccess: function (result) {
                        var con = new db.Database();
                        con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [
                            monitorId
                        ], function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(1).to.be(expectedResult.length);
                            con.close();
                            done();
                        });
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('status change NG->OK', function (done) {
                var monitorId = 1001;
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: monitorId,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'OK'
                }, userId, {
                    onSuccess: function (result) {
                        var con = new db.Database();
                        con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [
                            monitorId
                        ], function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(0).to.be(expectedResult.length);
                            con.close();
                            done();
                        });
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
        });
    });
});
