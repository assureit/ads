var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var DCase = (function (_super) {
    __extends(DCase, _super);
    function DCase() {
        _super.apply(this, arguments);

    }
    DCase.prototype.insert = function (params, callback) {
        var _this = this;
        this.con.query('INSERT INTO dcase(user_id, name) VALUES (?, ?)', [
            params.userId, 
            params.dcaseName
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            callback(result.insertId);
        });
    };
    return DCase;
})(model.Model);
exports.DCase = DCase;
