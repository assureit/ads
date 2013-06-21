var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')


var FileDAO = (function (_super) {
    __extends(FileDAO, _super);
    function FileDAO() {
        _super.apply(this, arguments);

    }
    FileDAO.prototype.insert = function (name, userId, callback) {
        var path = "dummy";
        this.con.query('INSERT INTO file(name, path, user_id) VALUES(?,?,?) ', [
            name, 
            path, 
            userId
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };
    FileDAO.prototype.update = function (id, path, callback) {
        this.con.query('UPDATE file SET path = ? where id = ?', [
            path, 
            id
        ], function (err, result) {
            if(err) {
                callback(err);
                return;
            }
            callback(err);
        });
    };
    return FileDAO;
})(model.DAO);
exports.FileDAO = FileDAO;
