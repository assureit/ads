var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var Commit = (function (_super) {
    __extends(Commit, _super);
    function Commit() {
        _super.apply(this, arguments);

    }
    Commit.prototype.insert = function (params, callback) {
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
            callback(result.insertId);
        });
    };
    return Commit;
})(model.Model);
exports.Commit = Commit;
