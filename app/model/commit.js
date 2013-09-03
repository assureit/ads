var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var model_user = require('./user');
var model_node = require('../model/node');

var asn_parser = require('../util/asn-parser');

var async = require('async');

var Commit = (function () {
    function Commit(id, prevCommitId, dcaseId, userId, message, data, dateTime, latestFlag) {
        this.id = id;
        this.prevCommitId = prevCommitId;
        this.dcaseId = dcaseId;
        this.userId = userId;
        this.message = message;
        this.data = data;
        this.dateTime = dateTime;
        this.latestFlag = latestFlag;
        this.latestFlag = !!this.latestFlag;
    }
    Commit.tableToObject = function (row) {
        return new Commit(row.id, row.prev_commit_id, row.dcase_id, row.user_id, row.message, row.data, row.date_time, row.latest_flag);
    };
    return Commit;
})();
exports.Commit = Commit;
var CommitDAO = (function (_super) {
    __extends(CommitDAO, _super);
    function CommitDAO() {
        _super.apply(this, arguments);
    }
    CommitDAO.prototype.insert = function (params, callback) {
        var _this = this;
        params.prevId = params.prevId || 0;
        this.con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, `user_id`, `message`) VALUES(?,now(),?,TRUE,?,?,?)', [params.data, params.prevId, params.dcaseId, params.userId, params.message], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            _this._clearLastUpdateFlag(params.dcaseId, result.insertId, function (err) {
                if (err) {
                    callback(err, null);
                }
                callback(err, result.insertId);
            });
        });
    };

    CommitDAO.prototype.update = function (id, data, callback) {
        this.con.query('UPDATE commit SET data=? WHERE id=?', [data, id], function (err, result) {
            callback(err);
        });
    };

    CommitDAO.prototype._clearLastUpdateFlag = function (dcaseId, latestCommitId, callback) {
        this.con.query('UPDATE commit SET latest_flag = FALSE WHERE dcase_id = ? AND id <> ? AND latest_flag = TRUE', [dcaseId, latestCommitId], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(err);
        });
    };

    CommitDAO.prototype.get = function (commitId, callback) {
        this.con.query('SELECT * FROM commit WHERE id=?', [commitId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            result = result[0];
            callback(err, new Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
        });
    };

    CommitDAO.prototype.list = function (dcaseId, callback) {
        this.con.query({ sql: 'SELECT * FROM commit c, user u WHERE c.user_id = u.id AND c.dcase_id = ? ORDER BY c.id', nestTables: true }, [dcaseId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }

            var list = new Array();
            result.forEach(function (row) {
                var c = new Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
                c.user = new model_user.User(row.u.id, row.u.login_name, row.u.delete_flag, row.u.system_flag);
                list.push(c);
            });
            callback(err, list);
        });
    };

    CommitDAO.prototype.commit = function (userId, previousCommitId, message, contents, commitCallback) {
        var _this = this;
        async.waterfall([
            function (callback) {
                _this.get(previousCommitId, function (err, com) {
                    callback(err, com);
                });
            },
            function (com, callback) {
                _this.insert({ data: contents, prevId: previousCommitId, dcaseId: com.dcaseId, userId: userId, message: message }, function (err, commitId) {
                    callback(err, com, commitId);
                });
            },
            function (com, commitId, callback) {
                var parser = new asn_parser.ASNParser();
                var nodes = parser.parseNodeList(contents);
                var nodeDAO = new model_node.NodeDAO(_this.con);
                nodeDAO.insertList(com.dcaseId, commitId, nodes, function (err) {
                    callback(err, com, commitId);
                });
            },
            function (com, commitId, callback) {
                _this.update(commitId, contents, function (err) {
                    return callback(err, { commitId: commitId });
                });
            }
        ], function (err, result) {
            if (err) {
                _this.con.rollback();
            }
            ;
            commitCallback(err, result);
        });
    };
    return CommitDAO;
})(model.DAO);
exports.CommitDAO = CommitDAO;

