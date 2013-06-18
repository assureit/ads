var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')

var error = require('../api/error')
var User = (function () {
    function User(id, loginName, deleteFlag, systemFlag) {
        this.id = id;
        this.loginName = loginName;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
    }
    return User;
})();
exports.User = User;
var UserDAO = (function (_super) {
    __extends(UserDAO, _super);
    function UserDAO() {
        _super.apply(this, arguments);

    }
    UserDAO.prototype.login = function (loginName, password, callback) {
    };
    UserDAO.prototype.register = function (loginName, password, callback) {
        var _this = this;
        this.con.query('INSERT INTO user(login_name) VALUES(?) ', [
            loginName
        ], function (err, result) {
            if(err) {
                if(err.code == 'ER_DUP_ENTRY') {
                    err = new error.DuplicatedError('The login name is already exist.');
                }
                callback(err, null);
                return;
            }
            _this.con.query('SELECT * FROM user WHERE login_name = ? ', [
                loginName
            ], function (err, result) {
                if(err) {
                    callback(err, null);
                }
                var resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
                callback(err, resultUser);
            });
        });
    };
    return UserDAO;
})(model.DAO);
exports.UserDAO = UserDAO;
