var db = require('../db/db')
var error = require('../api/error')
var model_dcase = require('../model/dcase')

var model_node = require('../model/node')
var model_monitor = require('../model/monitor')
var net_rec = require('../net/rec')
var async = require('async');
var CONFIG = require('config');
var con = new db.Database();
con.begin(function (err, result) {
    var monitor = new model_monitor.MonitorDAO(con);
    monitor.list(function (err, list) {
        var procCnt = 0;
        var skipCnt = 0;
        console.log('------- Process Start ------');
        if(err) {
            console.log(err);
            process.exit(1);
        }
        if(list.length == 0) {
            console.log('There is no processing object record.');
            console.log('-------- processe end ---------');
            process.exit(0);
        }
        async.forEachSeries(list, function (it, cb) {
            var dcase = new model_dcase.DCaseDAO(con);
            async.waterfall([
                function (callback) {
                    console.log('----------------');
                    console.log('monitor_node_id=' + it.id);
                    dcase.get(it.dcaseId, function (err, resultDCase) {
                        callback(err, resultDCase, false, null);
                    });
                }, 
                function (resultDCase, runFlag, commitId, callback) {
                    if(resultDCase.deleteFlag) {
                        callback(null, resultDCase, true, null);
                    } else {
                        console.log('DCaseName=' + resultDCase.name);
                        monitor.getLatestCommit(it.dcaseId, function (err, resultCommit) {
                            if(resultCommit) {
                                callback(err, resultDCase, false, resultCommit.id);
                            } else {
                                callback(null, resultDCase, true, null);
                            }
                        });
                    }
                }, 
                function (resultDCase, runFlag, commitId, callback) {
                    if(runFlag) {
                        callback(null, resultDCase, true, commitId);
                    } else {
                        console.log('COMMITID=' + commitId);
                        var node = new model_node.NodeDAO(con);
                        node.getNode(commitId, it.thisNodeId, function (err, resultNode) {
                            if(resultNode) {
                                callback(err, resultDCase, false, commitId);
                            } else {
                                callback(null, resultDCase, true, commitId);
                            }
                        });
                    }
                }, 
                function (resultDCase, runFlag, commitId, callback) {
                    console.log('Processing object record=' + runFlag);
                    if(runFlag) {
                        var rec = new net_rec.Rec();
                        rec.request('deleteMonitor', {
                            "nodeID ": it.id
                        }, function (err, resultMonitor) {
                            if(err) {
                                callback(err, resultDCase, false, commitId);
                            } else {
                                if(!resultMonitor.result) {
                                    callback(null, resultDCase, true, commitId);
                                } else {
                                    callback(new error.InvalidRequestError(null, resultMonitor), resultDCase, false, commitId);
                                }
                            }
                        });
                    } else {
                        callback(null, resultDCase, false, commitId);
                    }
                }, 
                function (resultDCase, runFlag, commitId, callback) {
                    if(runFlag) {
                        it.deleteFlag = true;
                        monitor.update(it, function (err) {
                            if(err) {
                                callback(err);
                            } else {
                                procCnt++;
                                callback(null);
                            }
                        });
                    } else {
                        skipCnt++;
                        callback(null);
                    }
                }            ], function (err) {
                if(err) {
                    console.log(err);
                    con.close();
                    process.exit(1);
                }
                cb();
            });
        }, function () {
            con.commit(function (err, result) {
                if(err) {
                    console.log(err);
                    process.exit(1);
                }
                con.close();
                console.log('-------- processe end ---------');
                console.log('SKIP:' + skipCnt);
                console.log('PROC:' + procCnt);
                process.exit(0);
            });
        });
    });
});
