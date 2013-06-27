var db = require('../db/db')

var constant = require('../constant')

var model_commit = require('../model/commit')


var model_monitor = require('../model/monitor')
var error = require('./error')
function modifyMonitorStatus(params, callback) {
    function addRebuttalNode(nodeList, params, thisNodeId) {
        var maxThisNodeId = 0;
        nodeList.forEach(function (node) {
            if(maxThisNodeId < node.ThisNodeId) {
                maxThisNodeId = node.ThisNodeId;
            }
        });
        maxThisNodeId++;
        nodeList.forEach(function (node) {
            if(thisNodeId == node.ThisNodeId) {
                node.Children.push(maxThisNodeId);
            }
        });
        var metaData = {
            Type: 'Issue',
            Subject: constant.REBUTTAL_SUBJECT,
            Description: constant.REBUTTAL_DESCRIPTION + '\r\n' + params.comment,
            Timestamp: params.timestamp,
            Visible: 'true'
        };
        var node = {
            ThisNodeId: maxThisNodeId,
            Description: params.comment,
            Children: [],
            NodeType: "Rebuttal",
            MetaData: metaData
        };
        nodeList.push(node);
        return maxThisNodeId;
    }
    function removeRebuttalNode(nodeList, thisNodeId, rebuttalThisNodeId) {
        var rebuttalNodePos;
        var cnt = 0;
        nodeList.forEach(function (node) {
            if(thisNodeId == node.thisNodeId) {
            }
            if(rebuttalThisNodeId == node.thisNodeId) {
                rebuttalNodePos = cnt;
            }
            cnt++;
        });
        nodeList.splice(rebuttalNodePos, 1);
    }
    var con = new db.Database();
    con.begin(function (err, result) {
        var monitorDAO = new model_monitor.monitorDAO(con);
        monitorDAO.select(params.systemNodeId, function (err, dcaseId, thisNodeId, rebuttalThisNodeId) {
            if(err) {
                callback.onFailure(err);
                return;
            }
            var commitDAO = new model_commit.CommitDAO(con);
            monitorDAO.getLatestCommit(dcaseId, function (err, latestCommit) {
                if(err) {
                    callback.onFailure(err);
                    return;
                }
                console.log('dcaseId:' + dcaseId);
                console.log('thisNodeId:' + thisNodeId);
                console.log('rebuttalThisNodeId:' + rebuttalThisNodeId);
                var data = JSON.parse(latestCommit.data);
                var nodeList = data.NodeList;
                var rebuttalId;
                if(rebuttalThisNodeId) {
                    if(params.status == 'OK') {
                    } else {
                        callback.onFailure(new error.InternalError('Rebuttal already exists. ', null));
                        return;
                    }
                } else {
                    if(params.status == 'NG') {
                        rebuttalId = addRebuttalNode(nodeList, params, thisNodeId);
                    } else {
                        callback.onFailure(new error.InternalError('Rebuttal does not exist. ', null));
                        return;
                    }
                }
                var commit_params = {
                    contents: nodeList,
                    commitId: latestCommit.id,
                    commitMessage: ''
                };
                monitorDAO.update(params.systemNodeId, rebuttalId, function (err) {
                    if(err) {
                        callback.onFailure(err);
                        return;
                    }
                    con.commit(function (err, result) {
                        callback.onSuccess(null);
                        con.close();
                    });
                });
            });
        });
    });
}
exports.modifyMonitorStatus = modifyMonitorStatus;
