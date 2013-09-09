var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var model_commit = require('./commit');
var model_user = require('./user');
var model_pager = require('./pager');
var error = require('../api/error');
var constant = require('../constant');
var async = require('async');
var _ = require('underscore');

var DCase = (function () {
    function DCase(id, name, projectId, userId, deleteFlag, type) {
        this.id = id;
        this.name = name;
        this.projectId = projectId;
        this.userId = userId;
        this.deleteFlag = deleteFlag;
        this.type = type;
        this.deleteFlag = !!this.deleteFlag;
        if (deleteFlag === undefined) {
            this.deleteFlag = false;
        }
        if (this.type === undefined) {
            this.type = constant.CASE_TYPE_DEFAULT;
        }
    }
    DCase.tableToObject = function (table) {
        return new DCase(table.id, table.name, table.project_id, table.user_id, table.delete_flag, table.type);
    };
    return DCase;
})();
exports.DCase = DCase;
var DCaseDAO = (function (_super) {
    __extends(DCaseDAO, _super);
    function DCaseDAO() {
        _super.apply(this, arguments);
    }
    DCaseDAO.prototype.get = function (id, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM dcase WHERE id = ?', [id], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result.length == 0) {
                    next(new error.NotFoundError('DCase is not found.', { id: id }));
                    return;
                }
                next(null, DCase.tableToObject(result[0]));
            }
        ], function (err, dcase) {
            callback(err, dcase);
        });
    };
    DCaseDAO.prototype.getDetail = function (id, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query({ sql: 'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag=TRUE and d.id = ?', nestTables: true }, [id], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result.length == 0) {
                    next(new error.NotFoundError('Effective DCase does not exist.', { id: id }));
                    return;
                }
                var row = result[0];
                var dcase = DCase.tableToObject(row.d);
                dcase.user = model_user.User.tableToObject(row.u);
                dcase.latestCommit = model_commit.Commit.tableToObject(row.c);
                dcase.latestCommit.user = model_user.User.tableToObject(row.cu);
                next(null, dcase);
            }
        ], function (err, result) {
            callback(err, result);
        });
    };
    DCaseDAO.prototype.insert = function (params, callback) {
        var _this = this;
        if (!params.projectId) {
            params.projectId = constant.SYSTEM_PROJECT_ID;
        }
        if (!params.type) {
            params.type = constant.CASE_TYPE_DEFAULT;
        }
        async.waterfall([
            function (next) {
                _this.con.query('SELECT count(id) as cnt FROM project WHERE id = ?', [params.projectId], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result[0].cnt == 0) {
                    next(new error.NotFoundError('Project Not Found.', params));
                    return;
                }
                _this.con.query('INSERT INTO dcase(user_id, name, project_id, type) VALUES (?, ?, ?, ?)', [params.userId, params.dcaseName, params.projectId, params.type], function (err, result) {
                    return next(err, result ? result.insertId : null);
                });
            }
        ], function (err, dcaseId) {
            callback(err, dcaseId, params.projectId);
        });
    };

    DCaseDAO.prototype.list = function (page, userId, projectId, tagList, callback) {
        var _this = this;
        var pager = new model_pager.Pager(page);
        var queryFrom = 'dcase d, commit c, user u, user cu, (SELECT DISTINCT p.* FROM project p, project_has_user pu WHERE p.id = pu.project_id AND p.delete_flag = FALSE AND (p.public_flag = TRUE OR pu.user_id = ?)) p ';
        var queryWhere = 'd.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE AND p.id = d.project_id ';
        var query = { sql: '', nestTables: true };

        var params = [];
        params.push(userId);
        if (projectId && projectId > 0) {
            queryWhere = queryWhere + 'AND p.id=? ';
            params.push(projectId);
        }
        if (tagList && tagList.length > 0) {
            var tagVars = _.map(tagList, function (it) {
                return '?';
            }).join(',');
            queryFrom = queryFrom + ', tag t, dcase_tag_rel r ';
            queryWhere = queryWhere + 'AND t.id = r.tag_id  ' + 'AND r.dcase_id = d.id ' + 'AND t.label IN (' + tagVars + ') ' + 'GROUP BY c.id ' + 'HAVING COUNT(t.id) = ? ';

            var tmp = tagList;
            params = params.concat(tmp).concat([tagList.length]);
        }
        query.sql = 'SELECT * FROM ' + queryFrom + 'WHERE ' + queryWhere + 'ORDER BY c.modified DESC, c.id desc LIMIT ? OFFSET ?';

        this.con.query(query, params.concat([pager.limit, pager.getOffset()]), function (err, result) {
            if (err) {
                callback(err, null, null);
                return;
            }

            var list = new Array();
            result.forEach(function (row) {
                var d = DCase.tableToObject(row.d);
                d.user = model_user.User.tableToObject(row.u);
                d.latestCommit = model_commit.Commit.tableToObject(row.c);
                d.latestCommit.user = model_user.User.tableToObject(row.cu);
                list.push(d);
            });

            _this.con.query('SELECT count(d.id) as cnt FROM ' + queryFrom + 'WHERE ' + queryWhere, params, function (err, countResult) {
                if (err) {
                    callback(err, null, null);
                    return;
                }
                pager.totalItems = 0;
                if (countResult.length > 0) {
                    pager.totalItems = countResult[0].cnt;
                }
                callback(err, pager, list);
            });
        });
    };

    DCaseDAO.prototype.remove = function (dcaseId, callback) {
        this.con.query('UPDATE dcase SET delete_flag=TRUE WHERE id = ?', [dcaseId], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(err);
        });
    };

    DCaseDAO.prototype.update = function (dcaseId, name, callback) {
        this.con.query('UPDATE dcase SET name=? WHERE id = ?', [name, dcaseId], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(err);
        });
    };
    return DCaseDAO;
})(model.DAO);
exports.DCaseDAO = DCaseDAO;

