var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mysql = require('mysql')
var events = require('events')
var Database = (function (_super) {
    __extends(Database, _super);
    function Database() {
        _super.call(this);
        this.con = Database.getConnection();
    }
    Database.getConnection = function getConnection() {
        return mysql.createConnection({
            host: 'localhost',
            user: 'ads_test',
            password: 'ads_test',
            database: 'ads'
        });
    };
    Database.prototype.query = function (sql, values, callback) {
        if(callback === undefined && typeof values === 'function') {
            callback = values;
        }
        callback = this._bindErrorHandler(callback);
        if(this.con) {
            this.con.query(sql, values, callback);
        } else {
            callback('Connection is closed');
        }
    };
    Database.prototype.begin = function (callback) {
        var _this = this;
        this.query('SET autocommit=0', function (err, result) {
            if(err) {
                callback(err, result);
            } else {
                _this.query('START TRANSACTION', function (err, result) {
                    callback(err, result);
                });
            }
        });
    };
    Database.prototype.commit = function (callback) {
        this.query('COMMIT', function (err, result) {
            callback(err, result);
        });
    };
    Database.prototype.rollback = function (callback) {
        callback = callback || function (err, result) {
            if(err) {
                throw err;
            }
        };
        if(this.con) {
            this.query('ROLLBACK', callback);
        } else {
            callback(null, null);
        }
    };
    Database.prototype._rollback = function (callback) {
        callback = callback || function (err, result) {
            if(err) {
                throw err;
            }
        };
        if(this.con) {
            this.con.query('ROLLBACK', function (err, query) {
                callback(err, query);
            });
        } else {
            callback(null, null);
        }
    };
    Database.prototype.endTransaction = function (callback) {
        this.query('SET autocommit=1', function (err, query) {
            callback(err, query);
        });
    };
    Database.prototype.close = function (callback) {
        callback = callback || function (err, result) {
            if(err) {
                throw err;
            }
        };
        if(this.con) {
            this.con.end(callback);
            this.con = null;
        }
    };
    Database.prototype._bindErrorHandler = function (callback) {
        var _this = this;
        return function (err, result) {
            if(err) {
                _this._rollback(function (err, result) {
                    _this.close();
                });
                _this.emit('error', err);
                throw err;
            }
            callback(err, result);
        };
    };
    return Database;
})(events.EventEmitter);
exports.Database = Database;
