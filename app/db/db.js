var mysql = require('mysql')
var Database = (function () {
    function Database() {
        this.errorHandler = ErrorHandler;
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
        callback = this.errorHandler.bind(callback);
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
        this.query('ROLLBACK', function (err, query) {
            callback(err, query);
        });
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
            this.con = undefined;
        }
    };
    return Database;
})();
exports.Database = Database;
(function (ErrorHandler) {
    function bind(callback) {
        var _this = this;
        return function (err, result) {
            if(err) {
                console.log('error handler');
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            callback(err, result);
        };
    }
    ErrorHandler.bind = bind;
})(exports.ErrorHandler || (exports.ErrorHandler = {}));
var ErrorHandler = exports.ErrorHandler;
