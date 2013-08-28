var db = require('../db/db');




var model_project = require('../model/project');






var async = require('async');
var _ = require('underscore');

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
    var projectDAO = new model_project.ProjectDAO(con);
    projectDAO.insert(params.name, params.isPublic, function (err, projectId) {
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

