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
        console.log(name);
        console.log(userId);
        var path = "dummy";
        this.con.query('INSERT INTO file(name, path, user_id) VALUES(?,?,?) ', [
            name, 
            path, 
            userId
        ], function (err, result) {
            console.log(err);
            if(err) {
                callback(err, null);
                return;
            }
            console.log('file:ccc');
            callback(err, 1);
        });
    };
    return FileDAO;
})(model.DAO);
exports.FileDAO = FileDAO;
