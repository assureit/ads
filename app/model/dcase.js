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
    function DCase(id, name, projectId, userId, deleteFlag) {
        this.id = id;
        this.name = name;
        this.projectId = projectId;
        this.userId = userId;
        this.deleteFlag = deleteFlag;
        this.deleteFlag = !!this.deleteFlag;
        if (deleteFlag === undefined) {
            this.deleteFlag = false;
        }
    }
    DCase.tableToObject = function (table) {
        return new DCase(table.id, table.name, table.project_id, table.user_id, table.delete_flag);
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
    DCaseDAO.prototype.insert = function (params, callback) {
        if (!params.projectId) {
            params.projectId = constant.SYSTEM_PROJECT_ID;
        }
        this.con.query('INSERT INTO dcase(user_id, name, project_id) VALUES (?, ?, ?)', [params.userId, params.dcaseName, params.projectId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };

    DCaseDAO.prototype.list = function (page, tagList, callback) {
        var _this = this;
        var pager = new model_pager.Pager(page);
        var query = { sql: 'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified DESC, c.id desc LIMIT ? OFFSET ? ', nestTables: true };
        var params = [pager.limit, pager.getOffset()];
        if (tagList && tagList.length > 0) {
            var tagVars = _.map(tagList, function (it) {
                return '?';
            }).join(',');
            query.sql = 'SELECT * ' + 'FROM dcase d, commit c, user u, user cu, tag t, dcase_tag_rel r ' + 'WHERE d.id = c.dcase_id ' + 'AND d.user_id = u.id ' + 'AND c.user_id = cu.id ' + 'AND t.id = r.tag_id  ' + 'AND r.dcase_id = d.id ' + 'AND c.latest_flag = TRUE ' + 'AND d.delete_flag = FALSE ' + 'AND t.label IN (' + tagVars + ') ' + 'GROUP BY c.id ' + 'HAVING COUNT(t.id) = ? ' + 'ORDER BY c.modified, c.id desc LIMIT ? OFFSET ?';
            var tmp = tagList;
            params = tmp.concat([tagList.length]).concat(params);
        }
        this.con.query(query, params, function (err, result) {
            if (err) {
                callback(err, null, null);
                return;
            }

            var list = new Array();
            result.forEach(function (row) {
                var d = new DCase(row.d.id, row.d.name, row.d.project_id, row.d.user_id, row.d.delete_flag);
                d.user = new model_user.User(row.u.id, row.u.login_name, row.u.delete_flag, row.u.system_flag);
                d.latestCommit = new model_commit.Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
                d.latestCommit.user = new model_user.User(row.cu.id, row.cu.login_name, row.cu.delete_flag, row.cu.system_flag);
                list.push(d);
            });

            var countSQL = 'SELECT count(d.id) as cnt from dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ';
            var countParams = [];
            if (tagList && tagList.length > 0) {
                var tagVars = _.map(tagList, function (it) {
                    return '?';
                }).join(',');
                countSQL = 'SELECT count(d.id) as cnt ' + 'FROM dcase d, commit c, user u, user cu, tag t, dcase_tag_rel r ' + 'WHERE d.id = c.dcase_id ' + 'AND d.user_id = u.id ' + 'AND c.user_id = cu.id ' + 'AND t.id = r.tag_id  ' + 'AND r.dcase_id = d.id ' + 'AND c.latest_flag = TRUE ' + 'AND d.delete_flag = FALSE ' + 'AND t.label IN (' + tagVars + ') ' + 'GROUP BY c.id ' + 'HAVING COUNT(t.id) = ? ';
                var tmp = tagList;
                countParams = tmp.concat([tagList.length]);
            }
            _this.con.query(countSQL, countParams, function (err, countResult) {
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

