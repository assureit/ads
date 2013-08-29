var db = require('../db/db');

var constant = require('../constant');
var model_dcase = require('../model/dcase');
var model_commit = require('../model/commit');
var model_project = require('../model/project');
var model_node = require('../model/node');


var model_user = require('../model/user');


var async = require('async');
var _ = require('underscore');
var CONFIG = require('config');

function getProjectList(params, userId, callback) {
    var con = new db.Database();
    var projectDAO = new model_project.ProjectDAO(con);
    params = params || {};
    async.waterfall([
        function (next) {
            projectDAO.list(userId, function (err, result) {
                next(err, result);
            });
        }
    ], function (err, result) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        var resultProjectlist = _.map(result, function (val) {
            return {
                projectId: val.id,
                projectName: val.name
            };
        });
        callback.onSuccess({
            projectList: resultProjectlist
        });
    });
}
exports.getProjectList = getProjectList;

function createProject(params, userId, callback) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);
    var projectDAO = new model_project.ProjectDAO(con);
    var dcaseDAO = new model_dcase.DCaseDAO(con);
    var commitDAO = new model_commit.CommitDAO(con);
    var nodeDAO = new model_node.NodeDAO(con);
    var dcaseStr = JSON.stringify(CONFIG.ads.stakeholderCase);
    var dcase = null;
    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        },
        function (next) {
            userDAO.select(userId, function (err, user) {
                return next(err, user);
            });
        },
        function (user, next) {
            dcase = JSON.parse(dcaseStr.replace('%USER%', user.loginName));
            projectDAO.insert(params.name, params.isPublic, function (err, projectId) {
                return next(err, user, projectId);
            });
        },
        function (user, projectId, next) {
            projectDAO.addMember(projectId, userId, function (err) {
                return next(err, user, projectId);
            });
        },
        function (user, projectId, next) {
            dcaseDAO.insert({ userId: userId, dcaseName: dcase.DCaseName, projectId: projectId, type: constant.CASE_TYPE_STAKEHOLDER }, function (err, dcaseId) {
                return next(err, user, projectId, dcaseId);
            });
        },
        function (user, projectId, dcaseId, next) {
            commitDAO.insert({ data: JSON.stringify(dcase.contents), dcaseId: dcaseId, userId: userId, message: 'Initial Commit' }, function (err, commitId) {
                return next(err, user, projectId, dcaseId, commitId);
            });
        },
        function (user, projectId, dcaseId, commitId, next) {
            nodeDAO.insertList(dcaseId, commitId, dcase.contents.NodeList, function (err) {
                return next(err, user, projectId, dcaseId, commitId);
            });
        },
        function (user, projectId, dcaseId, commitId, next) {
            con.commit(function (err, result) {
                return next(err, user, projectId, dcaseId, commitId);
            });
        }
    ], function (err, user, projectId, dcaseId, commitId) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess({ projectId: projectId });
    });
}
exports.createProject = createProject;

function editProject(params, userId, callback) {
    var con = new db.Database();
    var projectDAO = new model_project.ProjectDAO(con);
    projectDAO.edit(params.projectId, params.name, function (err) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess({ ok: true });
    });
}
exports.editProject = editProject;

function deleteProject(params, userId, callback) {
    var con = new db.Database();
    var projectDAO = new model_project.ProjectDAO(con);
    projectDAO.remove(userId, params.projectId, function (err) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess({ ok: true });
    });
}
exports.deleteProject = deleteProject;

