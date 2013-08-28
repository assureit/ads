var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');

var async = require('async');
var _ = require('underscore');

var Project = (function () {
    function Project(id, name, isPublic) {
        this.id = id;
        this.name = name;
        this.isPublic = isPublic;
    }
    Project.tableToObject = function (table) {
        return new Project(table.id, table.name, table.isPublic);
    };
    return Project;
})();
exports.Project = Project;

var ProjectDAO = (function (_super) {
    __extends(ProjectDAO, _super);
    function ProjectDAO() {
        _super.apply(this, arguments);
    }
    ProjectDAO.prototype.list = function (userId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM project AS p INNER JOIN project_has_user AS pu ON p.id=pu.project_id WHERE pu.user_id=?', [userId], function (err, result) {
                    next(err, result);
                });
            },
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push(Project.tableToObject(row));
                });
                next(null, list);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    ProjectDAO.prototype.insert = function (name, public_flag, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('INSERT INTO project(name, public_flag) VALUES(?, ?)', [name, public_flag], function (err, result) {
                    next(err, result);
                });
            }
        ], function (err, result) {
            callback(err, result.insertId);
        });
    };

    ProjectDAO.prototype.addMember = function (projectId, userId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('INSERT INTO project_has_user(project_id, user_id) VALUES(?, ?)', [projectId, userId], function (err, result) {
                    next(err, result);
                });
            }
        ], function (err, result) {
            callback(err);
        });
    };

    ProjectDAO.prototype.edit = function (projectId, name, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('UPDATE project SET name=? WHERE id=?', [name, projectId], function (err, result) {
                    next(err, result);
                });
            }
        ], function (err, result) {
            callback(err);
        });
    };
    return ProjectDAO;
})(model.DAO);
exports.ProjectDAO = ProjectDAO;

