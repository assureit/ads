var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_commit = require('./commit')
var model_user = require('./user')
var model_pager = require('./pager')
var DCase = (function () {
    function DCase(id, name, userId, deleteFlag) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.deleteFlag = deleteFlag;
        if(deleteFlag === undefined) {
            this.deleteFlag = false;
        }
    }
    return DCase;
})();
exports.DCase = DCase;
var DCaseDAO = (function (_super) {
    __extends(DCaseDAO, _super);
    function DCaseDAO() {
        _super.apply(this, arguments);

    }
    DCaseDAO.prototype.insert = function (params, callback) {
        var _this = this;
        this.con.query('INSERT INTO dcase(user_id, name) VALUES (?, ?)', [
            params.userId, 
            params.dcaseName
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            callback(result.insertId);
        });
    };
    DCaseDAO.prototype.list = function (page, callback) {
        var _this = this;
        var pager = new model_pager.Pager(page);
        this.con.query({
            sql: 'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = 1 AND d.delete_flag = FALSE ORDER BY c.modified desc LIMIT 20 OFFSET ? ',
            nestTables: true
        }, [
            pager.getOffset()
        ], function (err, result) {
            if(err) {
                _this.con.close();
                throw err;
            }
            var list = new Array();
            result.forEach(function (row) {
                var d = new DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
                d.user = new model_user.User(row.u.id, row.u.name, row.u.delete_flag, row.u.system_flag);
                d.latestCommit = new model_commit.Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
                d.latestCommit.user = new model_user.User(row.cu.id, row.cu.name, row.cu.delete_flag, row.cu.system_flag);
                list.push(d);
            });
            callback(pager, list);
        });
    };
    DCaseDAO.prototype.remove = function (dcaseId, callback) {
        var _this = this;
        this.con.query('UPDATE dcase SET delete_flag=TRUE WHERE id = ?', [
            dcaseId
        ], function (err, result) {
            if(err) {
                _this.con.close();
                throw err;
            }
            callback();
        });
    };
    DCaseDAO.prototype.update = function (dcaseId, name, callback) {
        var _this = this;
        this.con.query('UPDATE dcase SET name=? WHERE id = ?', [
            name, 
            dcaseId
        ], function (err, result) {
            if(err) {
                _this.con.close();
                throw err;
            }
            callback();
        });
    };
    return DCaseDAO;
})(model.Model);
exports.DCaseDAO = DCaseDAO;
