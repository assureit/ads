var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_commit = require('./commit')
var error = require('../api/error')

var async = require('async');
var MonitorNode = (function () {
    function MonitorNode(id, dcaseId, thisNodeId, watchId, presetId, params, rebuttalThisNodeId, publishStatus) {
        this.id = id;
        this.dcaseId = dcaseId;
        this.thisNodeId = thisNodeId;
        this.watchId = watchId;
        this.presetId = presetId;
        this.params = params;
        this.rebuttalThisNodeId = rebuttalThisNodeId;
        this.publishStatus = publishStatus;
    }
    MonitorNode.tableToObject = function tableToObject(table) {
        return new MonitorNode(table.id, table.dcase_id, table.this_node_id, table.watch_id, table.preset_id, table.params ? JSON.parse(table.params) : {
        }, table.rebuttal_this_node_id, table.publish_status);
    };
    return MonitorNode;
})();
exports.MonitorNode = MonitorNode;
var MonitorDAO = (function (_super) {
    __extends(MonitorDAO, _super);
    function MonitorDAO() {
        _super.apply(this, arguments);

    }
    MonitorDAO.prototype.insert = function (param, callback) {
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
    MonitorDAO.prototype.update = function (id, rebuttal_id, callback) {
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
    MonitorDAO.prototype.select = function (id, callback) {
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
    MonitorDAO.prototype.getLatestCommit = function (dcaseId, callback) {
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
    MonitorDAO.prototype.getItsId = function (issueId, callback) {
        this.con.query('SELECT its_id FROM issue WHERE id = ?', [
            issueId
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            if(result.length == 0) {
                callback(new error.NotFoundError('ITSID was not found.'), null);
                return;
            }
            callback(err, result[0].its_id);
        });
    };
    MonitorDAO.prototype.updatePublished = function (monitor, callback) {
        this.con.query('UPDATE monitor_node SET publish_status=1 WHERE id=?', [
            monitor.id
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, monitor);
        });
    };
    MonitorDAO.prototype.listNotPublished = function (dcaseId, callback) {
        this.con.query('SELECT * FROM monitor_node WHERE dcase_id=? AND publish_status != 1', [
            dcaseId
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            var list = [];
            result.forEach(function (it) {
                list.push(MonitorNode.tableToObject(it));
            });
            callback(null, list);
        });
    };
    MonitorDAO.prototype.publish = function (dcaseId, callback) {
        var _this = this;
        this.listNotPublished(dcaseId, function (err, list) {
            if(err) {
                callback(err);
                return;
            }
            _this._publish(list, callback);
        });
    };
    MonitorDAO.prototype._publish = function (list, callback) {
        var _this = this;
        if(!list || list.length == 0) {
            callback(null);
            return;
        }
        var monitor = list[0];
        var rec = new rec.Rec();
        var method = (monitor.publishStatus == 0) ? 'registMonitor' : 'updateMonitor';
        rec.request(method, {
            nodeID: monitor.id,
            name: 'DCase: ' + monitor.dcaseId + ' Node: ' + monitor.thisNodeId,
            watchID: monitor.watchId,
            presetID: monitor.presetId,
            params: monitor.params
        }, function (err, result) {
            if(err) {
                callback(err);
                return;
            }
            monitor.publishStatus = 1;
            _this.updatePublished(monitor, function (err, updated) {
                if(err) {
                    callback(err);
                    return;
                }
                _this._publish(list.slice(1), callback);
            });
        });
    };
    return MonitorDAO;
})(model.DAO);
exports.MonitorDAO = MonitorDAO;
