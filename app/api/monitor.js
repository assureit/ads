var db = require('../db/db');

var constant = require('../constant');
var model_commit = require('../model/commit');
var model_monitor = require('../model/monitor');
var model_dcase = require('../model/dcase');
var model_node = require('../model/node');
var redmine = require('../net/redmine');
var error = require('./error');
var _ = require('underscore');

function modifyMonitorStatus(params, userId, callback) {
    var commitMessage = 'monitor status exchange';

    function addRebuttalNode(nodeList, params, thisNodeId) {
        var maxThisNodeId = 0;

        nodeList.forEach(function (node) {
            if (maxThisNodeId < node.ThisNodeId)
                maxThisNodeId = node.ThisNodeId;
        });
        maxThisNodeId++;
        nodeList.forEach(function (node) {
            if (thisNodeId == node.ThisNodeId) {
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
            NodeType: 'Rebuttal',
            MetaData: [metaData]
        };

        nodeList.push(node);

        return maxThisNodeId;
    }

    function removeRebuttalNode(nodeList, thisNodeId, rebuttalThisNodeId) {
        var rebuttalNodePos = -1;
        var rebuttalChildrenPos = -1;
        var issueId = undefined;

        for (var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];
            if (thisNodeId == node.ThisNodeId) {
                for (var j = 0; j < node.Children.length; j++) {
                    if (node.Children[j] == rebuttalThisNodeId) {
                        rebuttalChildrenPos = j;
                    }
                }
                if (rebuttalChildrenPos > -1)
                    node.Children.splice(rebuttalChildrenPos, 1);
            }

            if (rebuttalThisNodeId == node.ThisNodeId) {
                rebuttalNodePos = i;
                var metaList = _.filter(node.MetaData, function (meta) {
                    return meta.Type == 'Issue';
                });
                if (metaList.length > 0)
                    issueId = metaList[0]._IssueId;
            }
        }
        if (rebuttalNodePos > -1)
            nodeList.splice(rebuttalNodePos, 1);

        return issueId;
    }

    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.evidenceId)
            checks.push('Evidence ID is required.');
        if (params && params.evidenceId && !isFinite(params.evidenceId))
            checks.push('Evidence ID must be a number.');
        if (params && !params.systemNodeId)
            checks.push('System Node ID is required.');
        if (params && params.systemNodeId && !isFinite(params.systemNodeId))
            checks.push('System Node ID must be a number.');
        if (params && !params.timestamp)
            checks.push('Timestamp is required.');
        if (params && !params.comment)
            checks.push('Comment is required.');
        if (params && !params.status)
            checks.push('Status is required.');
        if (params && params.status && !(params.status == 'OK' || params.status == 'NG'))
            checks.push('Status is OK or NG.');

        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }

    if (!validate(params))
        return;

    var con = new db.Database();

    con.begin(function (err, result) {
        var monitorDAO = new model_monitor.MonitorDAO(con);
        monitorDAO.select(params.systemNodeId, function (err, dcaseId, thisNodeId, rebuttalThisNodeId) {
            if (err) {
                callback.onFailure(err);
                con.close();
                return;
            }
            monitorDAO.getLatestCommit(dcaseId, function (err, latestCommit) {
                if (err) {
                    callback.onFailure(err);
                    con.close();
                    return;
                }

                var nodeDAO = new model_node.NodeDAO(con);
                nodeDAO.get(latestCommit.id, function (err, nodeList) {
                    if (err) {
                        callback.onFailure(err);
                        con.close();
                        return;
                    }
                    if (nodeList.length == 0) {
                        callback.onSuccess(null);
                        con.close();
                        return;
                    }

                    var dcaseDAO = new model_dcase.DCaseDAO(con);
                    dcaseDAO.get(dcaseId, function (err, dcase) {
                        if (err) {
                            if (err.code == error.RPC_ERROR.DATA_NOT_FOUND) {
                                callback.onSuccess(null);
                                con.close();
                                return;
                            } else {
                                callback.onFailure(err);
                                con.close();
                                return;
                            }
                        }
                        if (dcase.deleteFlag) {
                            callback.onSuccess(null);
                            return;
                        }

                        var data = JSON.parse(latestCommit.data);
                        var nodeList = data.NodeList;
                        var rebuttalId = null;
                        var issueId = null;

                        if (rebuttalThisNodeId) {
                            if (params.status == 'OK') {
                                issueId = removeRebuttalNode(nodeList, thisNodeId, rebuttalThisNodeId);
                                data.NodeCount--;
                            } else {
                                callback.onFailure(new error.InternalError('Rebuttal already exists. ', null));
                                return;
                            }
                        } else {
                            if (params.status == 'NG') {
                                rebuttalId = addRebuttalNode(nodeList, params, thisNodeId);
                                data.NodeCount++;
                            } else {
                                callback.onFailure(new error.InternalError('Rebuttal does not exist. ', null));
                                return;
                            }
                        }

                        var commitDAO = new model_commit.CommitDAO(con);
                        commitDAO.commit(userId, latestCommit.id, commitMessage, null, data, function (err, result) {
                            if (err) {
                                callback.onFailure(err);
                                return;
                            }

                            monitorDAO.setRebuttalThisNodeId(params.systemNodeId, rebuttalId, function (err) {
                                if (err) {
                                    callback.onFailure(err);
                                    return;
                                }
                                if (issueId) {
                                    monitorDAO.getItsId(issueId, function (err, itsId) {
                                        if (err) {
                                            callback.onFailure(err);
                                            return;
                                        }
                                        var redmineIssue = new redmine.Issue();
                                        redmineIssue.addComment(itsId, params.comment, function (err, result) {
                                            if (err) {
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
            });
        });
    });
}
exports.modifyMonitorStatus = modifyMonitorStatus;

