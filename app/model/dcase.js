var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var DCaseDAO = (function (_super) {
    __extends(DCaseDAO, _super);
    function DCaseDAO() {
        _super.apply(this, arguments);

    }
    DCaseDAO.prototype.insert = function (params, callback) {
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
    DCaseDAO.prototype.list = function (callback) {
        var _this = this;
        this.con.query('SELECT * FROM dcase', function (err, result) {
            if(err) {
                _this.con.close();
                throw err;
            }
            _this.con.close();
            var list = [];
            result.forEach(function (val) {
                list.push({
                    dcaseId: val.id,
                    dcaseName: val.name
                });
            });
            callback.onSuccess(list);
        });
    };
    return DCaseDAO;
})(model.Model);
exports.DCaseDAO = DCaseDAO;
