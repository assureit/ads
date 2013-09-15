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
    function Project(id, name, metaData, isPublic) {
        this.id = id;
        this.name = name;
        this.metaData = metaData;
        this.isPublic = isPublic;
    }
    Project.tableToObject = function (table) {
        return new Project(table.id, table.name, table.meta_data, table.public_flag);
    };
    return Project;
})();
exports.Project = Project;

var ProjectDAO = (function (_super) {
    __extends(ProjectDAO, _super);
    function ProjectDAO() {
        _super.apply(this, arguments);
    }
    ProjectDAO.prototype.get = function (userId, projectId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query({
                    sql: 'SELECT * FROM project AS p INNER JOIN project_has_user AS pu ON p.id=pu.project_id WHERE p.delete_flag=0 AND p.id=? AND (p.public_flag=1 OR pu.user_id=?)',
                    nestTables: true
                }, [projectId, userId], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push(Project.tableToObject(row.p));
                });
                if (list.length == 0) {
                    next(new error.ForbiddenError('You need permission to access the project', { userId: userId, projectId: projectId }));
                    return;
                }
                next(null, list[0]);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    ProjectDAO.prototype.list = function (userId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query({
                    sql: 'SELECT * FROM project AS p INNER JOIN project_has_user AS pu ON p.id=pu.project_id WHERE p.delete_flag=0 AND p.public_flag=0 AND pu.user_id=?',
                    nestTables: true
                }, [userId], function (err, result) {
                    next(err, result);
                });
            },
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push(Project.tableToObject(row.p));
                });
                next(null, list);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    ProjectDAO.prototype.publiclist = function (userId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM project AS p WHERE p.delete_flag=0 AND p.public_flag=1', function (err, result) {
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

    ProjectDAO.prototype.insert = function (name, metaData, public_flag, callback) {
        var _this = this;
        if (metaData === null || metaData === undefined)
            metaData = '';
        async.waterfall([
            function (next) {
                _this.con.query('INSERT INTO project(name, meta_data, public_flag) VALUES(?, ?, ?)', [name, metaData, public_flag], function (err, result) {
                    next(err, result);
                });
            }
        ], function (err, result) {
            if (err) {
                console.log('insert');
                console.log(JSON.stringify(err));
            }
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

    ProjectDAO.prototype.getProjectUserAndRole = function (projectId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT u.login_name, pu.role FROM user AS u INNER JOIN project_has_user AS pu ON u.id=pu.user_id WHERE pu.project_id=?', [projectId], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push([row.login_name, row.role]);
                });
                next(null, list);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    ProjectDAO.prototype.updateProjectUser = function (projectId, users, callback) {
        var _this = this;
        if (users == null || users.length == 0) {
            callback(null);
            return;
        }
        var roles = {};
        for (var i = 0; i < users.length; i++) {
            roles[users[i][0]] = users[i][1];
        }
        var userList = [];
        var vars;
        async.waterfall([
            function (next) {
                var names = _.map(users, function (it) {
                    return it[0];
                });
                var vars = _.map(users, function (it) {
                    return '?';
                }).join(',');
                _this.con.query('SELECT * FROM user WHERE login_name in (' + vars + ')', names, function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                var userIdList = [];
                result.forEach(function (row) {
                    userIdList.push(row.id);
                    userList.push({ id: row.id, name: row.login_name, role: (roles[row.login_name] || null) });
                });
                vars = _.map(userIdList, function (it) {
                    return '?';
                }).join(',');
                if (userIdList.length == 0) {
                    next(new error.NotFoundError('Project member is not found.', users));
                    return;
                }
                next(null, userIdList);
            },
            function (userIdList, next) {
                _this.con.query('DELETE FROM project_has_user WHERE project_id = ? AND user_id NOT IN (' + vars + ')', [projectId].concat(userIdList), function (err, result) {
                    return next(err, userIdList);
                });
            },
            function (userIdList, next) {
                _this.con.query('INSERT INTO project_has_user(project_id, user_id) SELECT ?, u.id FROM user u ' + 'WHERE u.id IN (' + vars + ') AND NOT EXISTS (SELECT id FROM project_has_user pu WHERE pu.user_id = u.id AND pu.project_id = ?)', [projectId].concat(userIdList).concat(projectId), function (err, result) {
                    return next(err);
                });
            },
            function (next) {
                async.waterfall(_.map(userList, function (user) {
                    return function (nxt) {
                        return _this.con.query('UPDATE project_has_user SET role=? WHERE user_id=? AND project_id=?', [user.role, user.id, projectId], function (err, result) {
                            return nxt(err);
                        });
                    };
                }), function (err) {
                    return next(err);
                });
            }
        ], function (err) {
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

    ProjectDAO.prototype.edit = function (projectId, name, metaData, public_flag, callback) {
        var _this = this;
        if (metaData === null || metaData === undefined)
            metaData = '';
        async.waterfall([
            function (next) {
                _this.con.query('UPDATE project SET name=?, meta_data=?, public_flag=? WHERE id=?', [name, metaData, public_flag, projectId], function (err, result) {
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

