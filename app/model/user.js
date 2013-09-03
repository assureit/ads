var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');

var error = require('../api/error');
var net_ldap = require('../net/ldap');

var User = (function () {
    function User(id, loginName, deleteFlag, systemFlag) {
        this.id = id;
        this.loginName = loginName;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
        this.deleteFlag = !!this.deleteFlag;
        this.systemFlag = !!this.systemFlag;
    }
    User.tableToObject = function (row) {
        return new User(row.id, row.login_name, row.delete_flag, row.system_flag);
    };
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
        function validate(loginName, password) {
            var checks = [];
            if (loginName.length == 0)
                checks.push('Login name is required.');
            if (loginName.length > 45)
                checks.push('Login name should not exceed 45 characters.');
            if (checks.length > 0) {
                callback(new error.InvalidParamsError(checks, null), null);
                return false;
            }
            return true;
        }
        if (!validate(loginName, password))
            return;

        var ldap = new net_ldap.Ldap();

        ldap.auth(loginName, password, function (err) {
            if (err) {
                console.error(err);
                err = new error.LoginError('Login name or Password is invalid.');
                callback(err, null);
                return;
            }

            _this.selectName(loginName, function (err, resultSelect) {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (resultSelect) {
                    callback(err, resultSelect);
                    return;
                } else {
                    _this.insert(loginName, function (err, resultInsert) {
                        if (err) {
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
        function validate(loginName, password) {
            var checks = [];
            if (loginName.length == 0)
                checks.push('Login name is required.');
            if (loginName.length > 45)
                checks.push('Login name should not exceed 45 characters.');
            if (password.length == 0)
                checks.push('Password is required.');
            if (checks.length > 0) {
                callback(new error.InvalidParamsError(checks, null), null);
                return false;
            }
            return true;
        }
        if (!validate(loginName, password))
            return;

        var ldap = new net_ldap.Ldap();
        ldap.add(loginName, password, function (err) {
            if (err) {
                callback(err, null);
                return;
            }
            _this.insert(loginName, function (err, resultInsert) {
                if (err) {
                    ldap.del(loginName, function (err2) {
                        if (err2) {
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
        this.con.query('SELECT * FROM user WHERE id = ? ', [id], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            var resultUser = null;
            if (result.length == 0) {
                err = new error.NotFoundError('UserId Not Found.');
            } else {
                resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
            }
            callback(err, resultUser);
        });
    };

    UserDAO.prototype.selectName = function (loginName, callback) {
        this.con.query('SELECT * FROM user WHERE login_name = ? ', [loginName], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            var resultUser = null;
            if (result.length > 0) {
                resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
            }
            callback(err, resultUser);
        });
    };

    UserDAO.prototype.projectUserList = function (projectId, callback) {
        this.con.query({ sql: 'SELECT u.* FROM user u INNER JOIN project_has_user AS pu ON pu.user_id=u.id WHERE project_id=?', nestTables: true }, [projectId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            var list = [];
            result.forEach(function (row) {
                list.push(User.tableToObject(row.u));
            });
            callback(null, list);
        });
    };

    UserDAO.prototype.insert = function (loginName, callback) {
        var _this = this;
        this.con.query('INSERT INTO user(login_name) VALUES(?) ', [loginName], function (err, result) {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') {
                    err = new error.DuplicatedError('The login name is already exist.');
                }
                callback(err, null);
                return;
            }
            _this.con.query('SELECT * FROM user WHERE login_name = ? ', [loginName], function (err, result) {
                if (err) {
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

