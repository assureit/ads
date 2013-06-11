var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_user = require('./user')
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
    }
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
        this.con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, `user_id`, `message`) VALUES(?,now(),?,TRUE,?,?,?)', [
            params.data, 
            params.prevId, 
            params.dcaseId, 
            params.userId, 
            params.message
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            _this._clearLastUpdateFlag(params.dcaseId, result.insertId, function () {
                callback(result.insertId);
            });
        });
    };
    CommitDAO.prototype._clearLastUpdateFlag = function (dcaseId, latestCommitId, callback) {
        var _this = this;
        this.con.query('UPDATE commit SET latest_flag = FALSE WHERE dcase_id = ? AND id <> ? AND latest_flag = TRUE', [
            dcaseId, 
            latestCommitId
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            console.log(result);
            callback();
        });
    };
    CommitDAO.prototype.get = function (commitId, callback) {
        var _this = this;
        this.con.query('SELECT * FROM commit WHERE id=?', [
            commitId
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            result = result[0];
            callback(new Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
        });
    };
    CommitDAO.prototype.list = function (dcaseId, callback) {
        var _this = this;
        this.con.query({
            sql: 'SELECT * FROM commit c, user u WHERE c.user_id = u.id AND c.dcase_id = ? ORDER BY c.id',
            nestTables: true
        }, [
            dcaseId
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            var list = [];
            result.forEach(function (row) {
                var c = new Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
                c.user = new model_user.User(row.u.id, row.u.name, row.u.delete_flag, row.u.system_flag);
                list.push(c);
            });
            callback(list);
        });
    };
    return CommitDAO;
})(model.Model);
exports.CommitDAO = CommitDAO;
