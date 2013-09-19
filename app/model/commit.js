var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var model_user = require('./user');
var model_node = require('../model/node');

var model_translator = require('../model/translator');
var asn_parser = require('../util/asn-parser');
var error = require('../api/error');

var async = require('async');

var Commit = (function () {
    function Commit(id, prevCommitId, dcaseId, userId, message, metaData, data, dateTime, latestFlag) {
        this.id = id;
        this.prevCommitId = prevCommitId;
        this.dcaseId = dcaseId;
        this.userId = userId;
        this.message = message;
        this.metaData = metaData;
        this.data = data;
        this.dateTime = dateTime;
        this.latestFlag = latestFlag;
        this.latestFlag = !!this.latestFlag;
    }
    Commit.tableToObject = function (row) {
        return new Commit(row.id, row.prev_commit_id, row.dcase_id, row.user_id, row.message, row.meta_data, row.data, row.date_time, row.latest_flag);
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
        if (params.metaData === null || params.metaData === undefined)
            params.metaData = '';
        this.con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, user_id, meta_data, message) VALUES(?,now(),?,TRUE,?,?,?,?)', [params.data, params.prevId, params.dcaseId, params.userId, params.metaData, params.message], function (err, result) {
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
            if (result.length == 0) {
                callback(new error.NotFoundError('Effective Commit does not exist.', { commitId: commitId }), null);
                return;
            }
            result = result[0];
            callback(err, Commit.tableToObject(result));
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
                var c = Commit.tableToObject(row.c);
                c.user = model_user.User.tableToObject(row.u);
                list.push(c);
            });
            callback(err, list);
        });
    };

    CommitDAO.prototype.commit = function (userId, previousCommitId, message, metaData, contents, commitCallback) {
        var _this = this;
        if (metaData === null || metaData === undefined)
            metaData = '';
        async.waterfall([
            function (callback) {
                _this.get(previousCommitId, function (err, com) {
                    callback(err, com);
                });
            },
            function (com, callback) {
                _this.insert({ data: contents, metaData: metaData, prevId: previousCommitId, dcaseId: com.dcaseId, userId: userId, message: message }, function (err, commitId) {
                    callback(err, com, commitId);
                });
            },
            function (com, commitId, callback) {
                var parser = new asn_parser.ASNParser();
                var nodes = null;
                try  {
                    nodes = parser.parseNodeList(contents);
                } catch (e) {
                    callback(e);
                    return;
                }
                var nodeDAO = new model_node.NodeDAO(_this.con);
                nodeDAO.insertList(com.dcaseId, commitId, nodes, function (err) {
                    callback(err, com, commitId);
                });
            },
            function (com, commitId, callback) {
                var parser = new asn_parser.ASNParser();
                var nodemodel = null;
                try  {
                    nodemodel = parser.parse(contents);
                } catch (e) {
                    callback(e);
                    return;
                }
                var translatorDAO = new model_translator.TranslatorDAO(_this.con);
                translatorDAO.translate(com.dcaseId, commitId, nodemodel, function (err, asn) {
                    if (asn) {
                        contents = asn;
                    }
                    callback(err, com, commitId);
                    return;
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

