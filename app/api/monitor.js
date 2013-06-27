var db = require('../db/db')

var constant = require('../constant')

var model_commit = require('../model/commit')


var model_monitor = require('../model/monitor')
var redmine = require('../net/redmine')
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
        var rebuttalNodePos = -1;
        var rebuttalChildrenPos = -1;
        var issueId = -1;
        for(var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];
            if(thisNodeId == node.thisNodeId) {
                for(var j = 0; j < node.Children.length; j++) {
                    if(node.Children[j] == rebuttalThisNodeId) {
                        rebuttalChildrenPos = j;
                    }
                }
                if(rebuttalChildrenPos > -1) {
                    node.Children.splice(rebuttalChildrenPos, 1);
                }
            }
            if(rebuttalThisNodeId == node.thisNodeId) {
                rebuttalNodePos = i;
                issueId = node.MetaData._IssueId;
            }
        }
        if(rebuttalNodePos > -1) {
            nodeList.splice(rebuttalNodePos, 1);
        }
        return issueId;
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
                var data = JSON.parse(latestCommit.data);
                var nodeList = data.NodeList;
                var rebuttalId = null;
                var issueId = null;
                if(rebuttalThisNodeId) {
                    if(params.status == 'OK') {
                        issueId = removeRebuttalNode(nodeList, thisNodeId, rebuttalThisNodeId);
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
                    console.log(issueId);
                    if(issueId) {
                        monitorDAO.getItsId(issueId, function (err, itsId) {
                            if(err) {
                                callback.onFailure(err);
                                return;
                            }
                            var redmineIssue = new redmine.Issue();
                            redmineIssue.addComment(itsId, params.comment, function (err, result) {
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
                    } else {
                        con.commit(function (err, result) {
                            callback.onSuccess(null);
                            con.close();
                        });
                    }
                });
            });
        });
    });
}
exports.modifyMonitorStatus = modifyMonitorStatus;
