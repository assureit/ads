var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var async = require('async');

exports.TYPE_GET_DCASE = 'getDCase';
exports.TYPE_GET_NODE_TREE = 'getNodeTree';

var AccessLog = (function () {
    function AccessLog(id, commitId, userId, accessType, accessed) {
        this.id = id;
        this.commitId = commitId;
        this.userId = userId;
        this.accessType = accessType;
        this.accessed = accessed;
    }
    AccessLog.tableToObject = function (row) {
        return new AccessLog(row.id, row.commit_id, row.user_id, row.access_type, row.accessed);
    };
    return AccessLog;
})();
exports.AccessLog = AccessLog;
var AccessLogDAO = (function (_super) {
    __extends(AccessLogDAO, _super);
    function AccessLogDAO() {
        _super.apply(this, arguments);
    }
    AccessLogDAO.prototype.insert = function (commitId, userId, accessType, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('INSERT INTO access_log(commit_id, user_id, access_type, accessed) VALUES(?,?,?,now())', [commitId, userId, accessType], function (err, result) {
                    return next(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    };
    return AccessLogDAO;
})(model.DAO);
exports.AccessLogDAO = AccessLogDAO;

