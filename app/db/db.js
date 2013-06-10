var mysql = require('mysql')
var Database = (function () {
    function Database() {
        this.con = Database.getConnection();
    }
    Database.getConnection = function getConnection() {
        return mysql.createConnection({
            host: 'localhost',
            user: 'ads_test',
            password: 'ads_test',
            database: 'dcase'
        });
    };
    Database.prototype.query = function (sql, values, callback) {
        this.con.query(sql, values, callback);
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
        this.con.end(callback);
    };
    return Database;
})();
exports.Database = Database;
