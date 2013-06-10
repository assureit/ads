var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
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
            _this._clearLastUpdateFlag(params.prevId, function () {
                callback(result.insertId);
            });
        });
    };
    CommitDAO.prototype._clearLastUpdateFlag = function (id, callback) {
        var _this = this;
        if(id == 0) {
            callback();
            return;
        }
        this.con.query('UPDATE commit SET latest_flag = FALSE WHERE id = ?', [
            id
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
    return CommitDAO;
})(model.Model);
exports.CommitDAO = CommitDAO;
