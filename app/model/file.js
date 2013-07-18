var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')

var error = require('../api/error')
var async = require('async');
var File = (function () {
    function File(id, name, path, userId) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.userId = userId;
    }
    File.tableToObject = function tableToObject(table) {
        return new File(table.id, table.name, table.path, table.user_id);
    };
    File.encodePath = function encodePath(path) {
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
    FileDAO.prototype.select = function (id, callback) {
        this.con.query('SELECT path, name from file where id = ?', [
            id
        ], function (err, result) {
            if(err) {
                callback(err, null, null);
                return;
            }
            if(result.length == 0) {
                callback(new error.NotFoundError('The information on the target file was not found.'), null, null);
                return;
            }
            callback(err, result[0].path, result[0].name);
        });
    };
    FileDAO.prototype.get = function (id, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * from file where id = ?', [
                    id
                ], function (err, result) {
                    return next(err, result);
                });
            }, 
            function (result, next) {
                if(result.length == 0) {
                    next(new error.NotFoundError('The information on the target file was not found.'), null);
                    return;
                }
                next(null, File.tableToObject(result[0]));
            }        ], function (err, file) {
            callback(err, file);
        });
    };
    return FileDAO;
})(model.DAO);
exports.FileDAO = FileDAO;
