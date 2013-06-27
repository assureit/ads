var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_commit = require('./commit')
var error = require('../api/error')
var monitorDAO = (function (_super) {
    __extends(monitorDAO, _super);
    function monitorDAO() {
        _super.apply(this, arguments);

    }
    monitorDAO.prototype.insert = function (param, callback) {
        this.con.query('INSERT INTO monitor_node(dcase_id, this_node_id, preset_id, params) VALUES(?,?,?,?) ', [
            param.dcaseId, 
            param.thisNodeId, 
            param.preSetId, 
            param.params
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };
    monitorDAO.prototype.update = function (id, rebuttal_id, callback) {
        this.con.query('UPDATE monitor_node  SET rebuttal_this_node_id = ? where id = ?', [
            rebuttal_id, 
            id
        ], function (err, result) {
            if(err) {
                callback(err);
                return;
            }
            callback(err);
        });
    };
    monitorDAO.prototype.select = function (id, callback) {
        this.con.query('SELECT dcase_id, this_node_id, rebuttal_this_node_id  from monitor_node where id = ?', [
            id
        ], function (err, result) {
            if(err) {
                callback(err, null, null, null);
                return;
            }
            if(result.length == 0) {
                callback(new error.NotFoundError('Specified id was not found. '), null, null, null);
                return;
            }
            callback(err, result[0].dcase_id, result[0].this_node_id, result[0].rebuttal_this_node_id);
        });
    };
    monitorDAO.prototype.getLatestCommit = function (dcaseId, callback) {
        this.con.query('SELECT * FROM commit WHERE dcase_id = ? AND latest_flag = TRUE', [
            dcaseId
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            if(result.length == 0) {
                callback(new error.NotFoundError('Specified dcase_id was not found. '), null);
                return;
            }
            result = result[0];
            callback(err, new model_commit.Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
        });
    };
    return monitorDAO;
})(model.DAO);
exports.monitorDAO = monitorDAO;
