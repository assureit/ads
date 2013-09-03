
var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var CONFIG = require('config');

var TestDB = (function () {
    function TestDB(con) {
        this.con = con;
        if (process.env.NODE_ENV != 'test')
            throw 'Using TestDB without NODE_ENV=test';
    }
    TestDB.prototype.loadAll = function (filePathList, callback) {
        var _this = this;
        if (filePathList.length == 0) {
            callback(null);
            return;
        }
        this.load(filePathList[0], function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this.loadAll(filePathList.slice(1), callback);
        });
    };

    TestDB.prototype.load = function (filePath, callback) {
        var _this = this;
        var fd = fs.readFileSync(filePath, 'utf8');
        try  {
            yaml.loadAll(fd, function (doc) {
                console.log(doc.commit[0].data);
                var tables = _.keys(doc);
                var loadFuncs = _.map(tables, function (table) {
                    return _this._buildLoadTableFunc(table, doc[table]);
                });
                async.waterfall(loadFuncs, function (err) {
                    callback(err);
                });
            });
        } catch (e) {
            callback(e);
            return;
        }
    };

    TestDB.prototype.loadTable = function (table, data, callback) {
        var _this = this;
        var queryFuncs = _.map(data, function (raw) {
            return _this._buildQuery(table, raw);
        });
        if (queryFuncs && queryFuncs.length) {
            async.waterfall(queryFuncs, function (err) {
                callback(err);
            });
        }
    };

    TestDB.prototype._buildLoadTableFunc = function (table, data) {
        var _this = this;
        return function (next) {
            _this.loadTable(table, data, function (err) {
                next(err);
            });
        };
    };

    TestDB.prototype._buildQuery = function (table, raw) {
        var _this = this;
        var columns = _.keys(raw);
        var sql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + _.map(columns, function (c) {
            return '?';
        }) + ')';
        var params = _.map(columns, function (c) {
            return raw[c];
        });
        return function (next) {
            _this.con.query(sql, params, function (err, result) {
                if (err) {
                    console.log('LOADING: ' + table + ' ' + JSON.stringify(raw));
                    console.log(err);
                }
                next(err);
            });
        };
    };

    TestDB.prototype.clearAll = function (callback) {
        this._clearAll(_.map(CONFIG.test.database.tables, function (table) {
            return table;
        }), callback);
    };

    TestDB.prototype._clearAll = function (tables, callback) {
        var _this = this;
        if (tables.length == 0) {
            callback(null);
            return;
        }
        this.clearTable(tables[0], function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this._clearAll(tables.slice(1), callback);
        });
    };

    TestDB.prototype.clearTable = function (table, callback) {
        this.con.query('DELETE FROM ' + table, function (err, result) {
            callback(err);
        });
    };
    return TestDB;
})();
exports.TestDB = TestDB;

