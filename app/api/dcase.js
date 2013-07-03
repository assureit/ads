var db = require('../db/db')


var model_dcase = require('../model/dcase')
var model_commit = require('../model/commit')
var model_node = require('../model/node')


var model_user = require('../model/user')

var async = require('async');
function searchDCase(params, userId, callback) {
    var con = new db.Database();
    var dcaseDAO = new model_dcase.DCaseDAO(con);
    params = params || {
    };
    dcaseDAO.list(params.page, function (err, pager, result) {
        if(err) {
            callback.onFailure(err);
            return;
        }
        con.close();
        var list = [];
        result.forEach(function (val) {
            list.push({
                dcaseId: val.id,
                dcaseName: val.name,
                userName: val.user.loginName,
                latestCommit: {
                    dateTime: val.latestCommit.dateTime,
                    commitId: val.latestCommit.id,
                    userName: val.latestCommit.user.loginName,
                    userId: val.latestCommit.userId,
                    commitMessage: val.latestCommit.message
                }
            });
        });
        callback.onSuccess({
            summary: {
                currentPage: pager.getCurrentPage(),
                maxPage: pager.getMaxPage(),
                totalItems: pager.totalItems,
                itemsPerPage: pager.limit
            },
            dcaseList: list
        });
    });
}
exports.searchDCase = searchDCase;
function getDCase(params, userId, callback) {
    var con = new db.Database();
    con.query({
        sql: 'SELECT * FROM dcase d, commit c WHERE d.id = c.dcase_id AND c.latest_flag=TRUE and d.id = ?',
        nestTables: true
    }, [
        params.dcaseId
    ], function (err, result) {
        if(err) {
            con.close();
            throw err;
        }
        con.close();
        var c = result[0].c;
        var d = result[0].d;
        callback.onSuccess({
            commitId: c.id,
            dcaseName: d.name,
            contents: c.data
        });
    });
}
exports.getDCase = getDCase;
function getNodeTree(params, userId, callback) {
    var con = new db.Database();
    con.query({
        sql: 'SELECT * FROM commit WHERE id = ?',
        nestTables: true
    }, [
        params.commitId
    ], function (err, result) {
        if(err) {
            con.close();
            throw err;
        }
        con.close();
        var c = result[0].commit;
        callback.onSuccess({
            contents: c.data
        });
    });
}
exports.getNodeTree = getNodeTree;
function searchNode(params, userId, callback) {
    var con = new db.Database();
    con.begin(function (err, result) {
        var nodeDAO = new model_node.NodeDAO(con);
        nodeDAO.search(params.page, params.text, function (err, pager, list) {
            if(err) {
                callback.onFailure(err);
                return;
            }
            var searchResultList = [];
            list.forEach(function (node) {
                searchResultList.push({
                    dcaseId: node.dcase.id,
                    nodeId: node.thisNodeId,
                    dcaseName: node.dcase.name,
                    description: node.description,
                    nodeType: node.nodeType
                });
            });
            callback.onSuccess({
                summary: {
                    currentPage: pager.getCurrentPage(),
                    maxPage: pager.getMaxPage(),
                    totalItems: pager.totalItems,
                    itemsPerPage: pager.limit
                },
                searchResultList: searchResultList
            });
            con.close();
        });
    });
}
exports.searchNode = searchNode;
function createDCase(params, userId, callback) {
    var con = new db.Database();
    con.begin(function (err, result) {
        var userDAO = new model_user.UserDAO(con);
        userDAO.select(userId, function (err, user) {
            if(err) {
                callback.onFailure(err);
                return;
            }
            var dcaseDAO = new model_dcase.DCaseDAO(con);
            dcaseDAO.insert({
                userId: userId,
                dcaseName: params.dcaseName
            }, function (err, dcaseId) {
                if(err) {
                    callback.onFailure(err);
                    return;
                }
                var commitDAO = new model_commit.CommitDAO(con);
                commitDAO.insert({
                    data: JSON.stringify(params.contents),
                    dcaseId: dcaseId,
                    userId: userId,
                    message: 'Initial Commit'
                }, function (err, commitId) {
                    if(err) {
                        callback.onFailure(err);
                        return;
                    }
                    var nodeDAO = new model_node.NodeDAO(con);
                    nodeDAO.insertList(dcaseId, commitId, params.contents.NodeList, function (err) {
                        if(err) {
                            callback.onFailure(err);
                            return;
                        }
                        con.commit(function (err, result) {
                            callback.onSuccess({
                                dcaseId: dcaseId,
                                commitId: commitId
                            });
                            con.close();
                        });
                    });
                });
            });
        });
    });
}
exports.createDCase = createDCase;
function commit(params, userId, callback) {
    var con = new db.Database();
    var commitDAO = new model_commit.CommitDAO(con);
    con.begin(function (err, result) {
        var userDAO = new model_user.UserDAO(con);
        userDAO.select(userId, function (err, user) {
            if(err) {
                callback.onFailure(err);
                return;
            }
            commitDAO.commit(userId, params.commitId, params.commitMessage, params.contents, function (err, result) {
                con.commit(function (err, _result) {
                    if(err) {
                        callback.onFailure(err);
                        return;
                    }
                    callback.onSuccess(result);
                    con.close();
                });
            });
        });
    });
}
exports.commit = commit;
;
function deleteDCase(params, userId, callback) {
    var con = new db.Database();
    con.begin(function (err, result) {
        var userDAO = new model_user.UserDAO(con);
        userDAO.select(userId, function (err, user) {
            if(err) {
                callback.onFailure(err);
                return;
            }
            var dcaseDAO = new model_dcase.DCaseDAO(con);
            dcaseDAO.remove(params.dcaseId, function (err) {
                if(err) {
                    callback.onFailure(err);
                    return;
                }
                con.commit(function (err, result) {
                    callback.onSuccess({
                        dcaseId: params.dcaseId
                    });
                    con.close();
                });
            });
        });
    });
}
exports.deleteDCase = deleteDCase;
function editDCase(params, userId, callback) {
    var con = new db.Database();
    con.begin(function (err, result) {
        var userDAO = new model_user.UserDAO(con);
        userDAO.select(userId, function (err, user) {
            if(err) {
                callback.onFailure(err);
                return;
            }
            var dcaseDAO = new model_dcase.DCaseDAO(con);
            dcaseDAO.update(params.dcaseId, params.dcaseName, function (err) {
                if(err) {
                    callback.onFailure(err);
                    return;
                }
                con.commit(function (err, result) {
                    if(err) {
                        callback.onFailure(err);
                        return;
                    }
                    callback.onSuccess({
                        dcaseId: params.dcaseId
                    });
                    con.close();
                });
            });
        });
    });
}
exports.editDCase = editDCase;
function getCommitList(params, userId, callback) {
    var con = new db.Database();
    var commitDAO = new model_commit.CommitDAO(con);
    commitDAO.list(params.dcaseId, function (err, list) {
        if(err) {
            callback.onFailure(err);
            return;
        }
        con.close();
        var commitList = [];
        list.forEach(function (c) {
            commitList.push({
                commitId: c.id,
                dateTime: c.dateTime,
                commitMessage: c.message,
                userId: c.userId,
                userName: c.user.loginName
            });
        });
        callback.onSuccess({
            commitList: commitList
        });
    });
}
exports.getCommitList = getCommitList;
