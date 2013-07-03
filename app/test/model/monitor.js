var db = require('../../db/db')
var model_monitor = require('../../model/monitor')

var expect = require('expect.js');
var async = require('async');
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send(req.body);
});
describe('model', function () {
    describe('monitor', function () {
        before(function (done) {
            app.listen(3030).on('listening', done);
        });
        var con;
        var monitorDAO;
        beforeEach(function (done) {
            con = new db.Database();
            con.begin(function (err, result) {
                monitorDAO = new model_monitor.MonitorDAO(con);
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
        describe('listNotPublish', function () {
            it('should not select publish_status 1', function (done) {
                var notPublishedList = [];
                var published = 0;
                async.waterfall([
                    function (next) {
                        con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params) VALUES (?, ?, ?, ?, ?)', [
                            40, 
                            1, 
                            10, 
                            100, 
                            JSON.stringify({
                                a: 'val_a',
                                b: 2
                            })
                        ], function (err, result) {
                            if(!err) {
                                notPublishedList.push(result.insertId);
                            }
                            next(err);
                        });
                    }, 
                    function (next) {
                        con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params, publish_status) VALUES (?, ?, ?, ?, ?, ?)', [
                            40, 
                            2, 
                            20, 
                            200, 
                            null, 
                            2
                        ], function (err, result) {
                            if(!err) {
                                notPublishedList.push(result.insertId);
                            }
                            next(err);
                        });
                    }, 
                    function (next) {
                        con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params, publish_status) VALUES (?, ?, ?, ?, ?, ?)', [
                            40, 
                            3, 
                            30, 
                            300, 
                            null, 
                            1
                        ], function (err, result) {
                            if(!err) {
                                published = result.insertId;
                            }
                            next(err);
                        });
                    }, 
                    function (next) {
                        monitorDAO.listNotPublished(40, function (err, list) {
                            expect(list).not.to.be(null);
                            expect(list.length > 0).to.equal(true);
                            list.forEach(function (it) {
                                expect(it.id).not.to.equal(published);
                            });
                            next(err);
                        });
                    }                ], function (err, result) {
                    expect(err).to.be(null);
                    done();
                });
            });
        });
        describe('publish', function () {
            it('should update publish_status to 1', function (done) {
                async.waterfall([
                    function (next) {
                        con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params) VALUES (?, ?, ?, ?, ?)', [
                            40, 
                            1, 
                            10, 
                            100, 
                            JSON.stringify({
                                a: 'val_a',
                                b: 2
                            })
                        ], function (err, result) {
                            return next(err);
                        });
                    }, 
                    function (next) {
                        con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params, publish_status) VALUES (?, ?, ?, ?, ?, ?)', [
                            40, 
                            2, 
                            20, 
                            200, 
                            null, 
                            2
                        ], function (err, result) {
                            return next(err);
                        });
                    }, 
                    function (next) {
                        monitorDAO.publish(40, function (err) {
                            next(err);
                        });
                    }, 
                    function (next) {
                        monitorDAO.listNotPublished(40, function (err, list) {
                            expect(list).not.to.be(null);
                            expect(list.length).to.equal(0);
                            next(err);
                        });
                    }                ], function (err, result) {
                    expect(err).to.be(null);
                    done();
                });
            });
        });
    });
});
