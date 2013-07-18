var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_commit = require('./commit')
var error = require('../api/error')
var net_rec = require('../net/rec')
var async = require('async');
exports.PUBLISH_STATUS_NONE = 0;
exports.PUBLISH_STATUS_PUBLISHED = 1;
exports.PUBLISH_STATUS_UPDATED = 2;
var MonitorNode = (function () {
    function MonitorNode(id, dcaseId, thisNodeId, watchId, presetId, params, rebuttalThisNodeId, publishStatus, deleteFlag) {
        this.id = id;
        this.dcaseId = dcaseId;
        this.thisNodeId = thisNodeId;
        this.watchId = watchId;
        this.presetId = presetId;
        this.params = params;
        this.rebuttalThisNodeId = rebuttalThisNodeId;
        this.publishStatus = publishStatus;
        this.deleteFlag = deleteFlag;
        if(!this.publishStatus) {
            this.publishStatus = exports.PUBLISH_STATUS_NONE;
        }
        if(!this.params) {
            this.params = {
            };
        }
        this.deleteFlag = !!this.deleteFlag;
        if(this.deleteFlag === undefined) {
            this.deleteFlag = false;
        }
    }
    MonitorNode.tableToObject = function tableToObject(table) {
        return new MonitorNode(table.id, table.dcase_id, table.this_node_id, table.watch_id, table.preset_id, table.params ? JSON.parse(table.params) : {
        }, table.rebuttal_this_node_id, table.publish_status, table.delete_flag);
    };
    return MonitorNode;
})();
exports.MonitorNode = MonitorNode;
var MonitorDAO = (function (_super) {
    __extends(MonitorDAO, _super);
    function MonitorDAO() {
        _super.apply(this, arguments);

    }
    MonitorDAO.prototype.get = function (id, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM monitor_node WHERE id=?', [
                    id
                ], function (err, result) {
                    next(err, result);
                });
            }, 
            function (result, next) {
                if(result.length == 0) {
                    next(new error.NotFoundError('The monitor node was not found. [ID: ' + id + ']'));
                    return;
                }
                var monitor = MonitorNode.tableToObject(result[0]);
                next(null, monitor);
            }        ], function (err, monitor) {
            callback(err, monitor);
        });
    };
    MonitorDAO.prototype.findByThisNodeId = function (dcaseId, thisNodeId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM monitor_node WHERE dcase_id=? AND this_node_id=?', [
                    dcaseId, 
                    thisNodeId
                ], function (err, result) {
                    next(err, result);
                });
            }, 
            function (result, next) {
                if(result.length == 0) {
                    next(new error.NotFoundError('The monitor node was not found. [DCase ID: ' + dcaseId + ', This_Node_Id: ' + thisNodeId + ']'));
                    return;
                }
                var monitor = MonitorNode.tableToObject(result[0]);
                next(null, monitor);
            }        ], function (err, monitor) {
            callback(err, monitor);
        });
    };
    MonitorDAO.prototype.insert = function (monitor, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('INSERT INTO monitor_node (dcase_id, this_node_id, watch_id, preset_id, params) VALUES(?,?,?,?,?)', [
                    monitor.dcaseId, 
                    monitor.thisNodeId, 
                    monitor.watchId, 
                    monitor.presetId, 
                    JSON.stringify(monitor.params)
                ], function (err, result) {
                    next(err, result);
                });
            }        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };
    MonitorDAO.prototype.update = function (monitor, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('UPDATE monitor_node SET dcase_id=?, this_node_id=?, watch_id=?, preset_id=?, params=?, rebuttal_this_node_id=?, publish_status=?, delete_flag=? WHERE id=?', [
                    monitor.dcaseId, 
                    monitor.thisNodeId, 
                    monitor.watchId, 
                    monitor.presetId, 
                    JSON.stringify(monitor.params), 
                    monitor.rebuttalThisNodeId, 
                    monitor.publishStatus, 
                    monitor.deleteFlag, 
                    monitor.id
                ], function (err, result) {
                    next(err);
                });
            }        ], function (err) {
            callback(err);
        });
    };
    MonitorDAO.prototype.setRebuttalThisNodeId = function (id, rebuttal_id, callback) {
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
                callback(new error.NotFoundError('Specified id was not found. [id: ' + id + ']'), null, null, null);
                return;
            }
            callback(err, result[0].dcase_id, result[0].this_node_id, result[0].rebuttal_this_node_id);
        });
    };
    MonitorDAO.prototype.getLatestCommit = function (dcaseId, callback) {
        this.con.query('SELECT * FROM commit WHERE dcase_id = ? AND latest_flag = TRUE ORDER BY id desc', [
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
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('UPDATE monitor_node SET publish_status=? WHERE id=?', [
                    exports.PUBLISH_STATUS_PUBLISHED, 
                    monitor.id
                ], function (err, result) {
                    next(err);
                });
            }        ], function (err) {
            callback(err, monitor);
        });
    };
    MonitorDAO.prototype.list = function (callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM monitor_node where delete_flag = false', function (err, result) {
                    next(err, result);
                });
            }, 
            function (result, next) {
                var list = [];
                result.forEach(function (it) {
                    list.push(MonitorNode.tableToObject(it));
                });
                next(null, list);
            }        ], function (err, list) {
            callback(err, list);
        });
    };
    MonitorDAO.prototype.listNotPublished = function (dcaseId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM monitor_node WHERE dcase_id=? AND publish_status != ?', [
                    dcaseId, 
                    exports.PUBLISH_STATUS_PUBLISHED
                ], function (err, result) {
                    next(err, result);
                });
            }, 
            function (result, next) {
                var list = [];
                result.forEach(function (it) {
                    list.push(MonitorNode.tableToObject(it));
                });
                next(null, list);
            }        ], function (err, list) {
            callback(err, list);
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
        var rec = new net_rec.Rec();
        var method = (monitor.publishStatus == exports.PUBLISH_STATUS_NONE) ? 'registMonitor' : 'updateMonitor';
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
