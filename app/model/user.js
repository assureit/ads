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
    function User(id, loginName, mailAddress, deleteFlag, systemFlag) {
        this.id = id;
        this.loginName = loginName;
        this.mailAddress = mailAddress;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
        this.deleteFlag = !!this.deleteFlag;
        this.systemFlag = !!this.systemFlag;
    }
    User.tableToObject = function (row) {
        return new User(row.id, row.login_name, row.mail_address, row.delete_flag, row.system_flag);
    };
    return User;
})();
exports.User = User;

var UserDAO = (function (_super) {
    __extends(UserDAO, _super);
    function UserDAO() {
        _super.apply(this, arguments);
    }
    UserDAO.prototype.login = function (loginName, callback) {
        var _this = this;
        function validate(loginName) {
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
        if (!validate(loginName))
            return;

        var ldap = new net_ldap.Ldap();

        this.selectName(loginName, function (err, resultSelect) {
            if (err) {
                callback(err, null);
                return;
            }

            if (resultSelect) {
                callback(err, resultSelect);
                return;
            } else {
                _this.insert(loginName, null, function (err, resultInsert) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    callback(null, resultInsert);
                    return;
                });
            }
        });
    };

    UserDAO.prototype.register = function (loginName, email, callback) {
        function validate(loginName) {
            var checks = [];
            if (loginName.length == 0)
                checks.push('Login name is required.');
            if (loginName.length > 45)
                checks.push('Login name should not exceed 45 characters.');
            if (email && email.length > 256)
                checks.push('Email should not exceed 256 characters.');
            if (checks.length > 0) {
                callback(new error.InvalidParamsError(checks, null), null);
                return false;
            }
            return true;
        }
        if (!validate(loginName))
            return;

        this.insert(loginName, email, function (err, resultInsert) {
            if (err) {
                callback(err, null);
                return;
            } else {
                callback(null, resultInsert);
            }
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
                resultUser = User.tableToObject(result[0]);
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
                resultUser = User.tableToObject(result[0]);
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

    UserDAO.prototype.insert = function (loginName, mailAddress, callback) {
        var _this = this;
        if (!mailAddress)
            mailAddress = '';
        this.con.query('INSERT INTO user(login_name, mail_address) VALUES(?, ?) ', [loginName, mailAddress], function (err, result) {
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
                var resultUser = User.tableToObject(result[0]);
                callback(err, resultUser);
            });
        });
    };
    return UserDAO;
})(model.DAO);
exports.UserDAO = UserDAO;

