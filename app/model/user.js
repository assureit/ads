var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')

var error = require('../api/error')
var net_ldap = require('../net/ldap')
var User = (function () {
    function User(id, loginName, deleteFlag, systemFlag) {
        this.id = id;
        this.loginName = loginName;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
        this.deleteFlag = !!this.deleteFlag;
        this.systemFlag = !!this.systemFlag;
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
        var _this = this;
        var ldap = new net_ldap.Ldap();
        ldap.auth(loginName, password, function (err) {
            if(err) {
                err = new error.LoginError('Login name or Password is invalid.');
                callback(err, null);
                return;
            }
            _this.selectName(loginName, function (err, resultSelect) {
                if(err) {
                    callback(err, null);
                    return;
                }
                if(resultSelect) {
                    callback(err, resultSelect);
                    return;
                } else {
                    _this.insert(loginName, function (err, resultInsert) {
                        if(err) {
                            callback(err, null);
                            return;
                        }
                        callback(null, resultInsert);
                        return;
                    });
                }
            });
        });
    };
    UserDAO.prototype.register = function (loginName, password, callback) {
        var _this = this;
        var ldap = new net_ldap.Ldap();
        ldap.add(loginName, password, function (err) {
            if(err) {
                err = new error.InternalError('OpenLDAP registration failure', err);
                callback(err, null);
                return;
            }
            _this.insert(loginName, function (err, resultInsert) {
                if(err) {
                    ldap.del(loginName, function (err2) {
                        if(err2) {
                            callback(err2, null);
                            return;
                        }
                        callback(err, null);
                        return;
                    });
                } else {
                    callback(null, resultInsert);
                }
            });
        });
    };
    UserDAO.prototype.select = function (id, callback) {
        this.con.query('SELECT * FROM user WHERE id = ? ', [
            id
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            var resultUser = null;
            if(result.length == 0) {
                err = new error.NotFoundError('UserId Not Found.');
            } else {
                resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
            }
            callback(err, resultUser);
        });
    };
    UserDAO.prototype.selectName = function (loginName, callback) {
        this.con.query('SELECT * FROM user WHERE login_name = ? ', [
            loginName
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            var resultUser = null;
            if(result.length > 0) {
                resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
            }
            callback(err, resultUser);
        });
    };
    UserDAO.prototype.insert = function (loginName, callback) {
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
