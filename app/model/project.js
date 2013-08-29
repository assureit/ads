var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var error = require('../api/error');
var constant = require('../constant');

var model_dcase = require('./dcase');
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

    ProjectDAO.prototype.remove = function (userId, projectId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT count(id) as cnt FROM project_has_user WHERE project_id = ? AND user_id = ?', [projectId, userId], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result[0].cnt == 0) {
                    next(new error.ForbiddenError('You need permission to remove the project', { userId: userId, projectId: projectId }));
                } else {
                    next();
                }
            },
            function (next) {
                _this.con.query('UPDATE project SET delete_flag=TRUE WHERE id=?', [projectId], function (err, result) {
                    return next(err, result);
                });
            }
        ], function (err, result) {
            callback(err);
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

    ProjectDAO.prototype.updateMember = function (dcaseId, callback) {
        var _this = this;
        var dcaseDAO = new model_dcase.DCaseDAO(this.con);
        var dcase;
        async.waterfall([
            function (next) {
                dcaseDAO.getDetail(dcaseId, function (err, dc) {
                    return next(err, dc);
                });
            },
            function (dc, next) {
                dcase = dc;
                if (dcase.type != constant.CASE_TYPE_STAKEHOLDER) {
                    callback(null);
                    return;
                }
                var data = JSON.parse(dcase.latestCommit.data);
                var evidences = _.filter(data.contents.NodeList, function (it) {
                    return it.NodeType == 'Evidence';
                });
                var users = _.uniq(_.flatten(_.map(evidences, function (it) {
                    return it.Description.split('\n');
                })));

                var vars = _.map(users, function (it) {
                    return '?';
                }).join(',');
                _this.con.query('SELECT * FROM user WHERE login_name in (' + vars + ')', users, function (err, result) {
                    return next(err, users, result);
                });
            },
            function (users, result, next) {
                var userIdList = [];
                result.forEach(function (row) {
                    userIdList.push(row.id);
                });
                if (userIdList.length == 0) {
                    next(new error.NotFoundError('Project member is not found.', users));
                    return;
                }
                next(null, userIdList);
            },
            function (userIdList, next) {
                var vars = _.map(userIdList, function (it) {
                    return '?';
                }).join(',');
                _this.con.query('DELETE FROM PROJECT_HAS_USER WHERE project_id = ? AND user_id NOT IN (' + vars + ')', [dcase.projectId].concat(userIdList), function (err, result) {
                    return next(err, userIdList);
                });
            },
            function (userIdList, next) {
                var vars = _.map(userIdList, function (it) {
                    return '?';
                }).join(',');
                _this.con.query('INSERT INTO project_has_user(project_id, user_id) SELECT ?, u.id FROM user u WHERE u.id IN (' + vars + ') AND NOT EXISTS (SELECT id FROM project_has_user pu WHERE pu.user_id = u.id AND pu.project_id = ?)', [dcase.projectId].concat(userIdList).concat(dcase.projectId), function (err, result) {
                    return next(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    };
    return ProjectDAO;
})(model.DAO);
exports.ProjectDAO = ProjectDAO;

