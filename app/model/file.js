var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');

var error = require('../api/error');
var async = require('async');

var File = (function () {
    function File(id, name, path, userId) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.userId = userId;
    }
    File.tableToObject = function (table) {
        return new File(table.id, table.name, table.path, table.user_id);
    };
    File.encodePath = function (path) {
        return encodeURI(path.replace(' ', '-'));
    };

    File.prototype.getEncodeName = function () {
        return File.encodePath(this.name);
    };
    return File;
})();
exports.File = File;
var FileDAO = (function (_super) {
    __extends(FileDAO, _super);
    function FileDAO() {
        _super.apply(this, arguments);
    }
    FileDAO.prototype.insert = function (name, userId, callback) {
        var path = "dummy";
        this.con.query('INSERT INTO file(name, path, user_id) VALUES(?,?,?) ', [name, path, userId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };

    FileDAO.prototype.update = function (id, path, callback) {
        this.con.query('UPDATE file SET path = ? where id = ?', [path, id], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(err);
        });
    };

    FileDAO.prototype.get = function (id, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * from file where id = ?', [id], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result.length == 0) {
                    next(new error.NotFoundError('The information on the target file was not found.'), null);
                    return;
                }
                next(null, File.tableToObject(result[0]));
            }
        ], function (err, file) {
            callback(err, file);
        });
    };
    return FileDAO;
})(model.DAO);
exports.FileDAO = FileDAO;

