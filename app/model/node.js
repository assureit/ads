var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_dcase = require('./dcase')
var model_pager = require('./pager')
var model_issue = require('./issue')
var model_monitor = require('./monitor')
var error = require('../api/error')
var _ = require('underscore');
var async = require('async');
var Node = (function () {
    function Node(id, commitId, thisNodeId, nodeType, description) {
        this.id = id;
        this.commitId = commitId;
        this.thisNodeId = thisNodeId;
        this.nodeType = nodeType;
        this.description = description;
    }
    return Node;
})();
exports.Node = Node;
var NodeDAO = (function (_super) {
    __extends(NodeDAO, _super);
    function NodeDAO() {
        _super.apply(this, arguments);

    }
    NodeDAO.prototype.processNodeList = function (dcaseId, commitId, list, callback) {
        this._processNodeList(dcaseId, commitId, list, list, callback);
    };
    NodeDAO.prototype._processNodeList = function (dcaseId, commitId, list, originalList, callback) {
        var _this = this;
        if(list.length == 0) {
            callback(null);
            return;
        }
        this.processMetaDataList(dcaseId, commitId, list[0], list[0].MetaData, originalList, function (err) {
            if(err) {
                callback(err);
                return;
            }
            _this._processNodeList(dcaseId, commitId, list.slice(1), originalList, callback);
        });
    };
    NodeDAO.prototype.processMetaDataList = function (dcaseId, commitId, node, list, originalList, callback) {
        var _this = this;
        if(!list || list.length == 0) {
            callback(null);
            return;
        }
        this.processMetaData(dcaseId, commitId, node, list[0], originalList, function (err) {
            if(err) {
                callback(err);
                return;
            }
            _this.processMetaDataList(dcaseId, commitId, node, list.slice(1), originalList, callback);
        });
    };
    NodeDAO.prototype.processMetaData = function (dcaseId, commitId, node, meta, originalList, callback) {
        if(meta.Type == 'Issue' && !meta._IssueId) {
            var issueDAO = new model_issue.IssueDAO(this.con);
            issueDAO.insert(new model_issue.Issue(0, dcaseId, null, meta.Subject, meta.Description), function (err, result) {
                if(err) {
                    callback(err);
                    return;
                }
                meta._IssueId = result.id;
                callback(null);
            });
            return;
        } else if(meta.Type == 'Monitor' && !meta._MonitorNodeId) {
            var monitorDAO = new model_monitor.MonitorDAO(this.con);
            var params = _.reduce(_.filter(_.flatten(_.map(_.filter(originalList, function (it) {
                return _.find(node.Children, function (childId) {
                    return it.ThisNodeId == childId && it.NodeType == 'Context';
                });
            }), function (it) {
                return it.MetaData;
            })), function (it) {
                return it.Type == 'Parameter';
            }), function (param, it) {
                return _.extend(param, it);
            }, {
            });
            params = _.omit(params, [
                'Type', 
                'Visible'
            ]);
            async.waterfall([
                function (next) {
                    monitorDAO.findByThisNodeId(dcaseId, node.ThisNodeId, function (err, monitor) {
                        if(err instanceof error.NotFoundError) {
                            next(null, null);
                        } else {
                            next(err, monitor);
                        }
                    });
                }, 
                function (monitor, next) {
                    if(monitor) {
                        if(meta.WatchId != monitor.watchId || meta.PresetId != monitor.watchId || JSON.stringify(params) != JSON.stringify(monitor.params)) {
                            monitor.watchId = meta.WatchId;
                            monitor.presetId = meta.PresetId;
                            monitor.params = params;
                            monitor.publishStatus = model_monitor.PUBLISH_STATUS_UPDATED;
                            monitorDAO.update(monitor, function (err) {
                                if(!err) {
                                    meta._MonitorNodeId = monitor.id;
                                }
                                next(err);
                            });
                        } else {
                            next(null);
                        }
                    } else {
                        monitorDAO.insert(new model_monitor.MonitorNode(0, dcaseId, node.ThisNodeId, meta.WatchId, meta.PresetId, params), function (err, monitorId) {
                            if(!err) {
                                meta._MonitorNodeId = monitorId;
                            }
                            next(err);
                        });
                    }
                }            ], function (err) {
                callback(err);
            });
            return;
        } else {
            callback(null);
            return;
        }
    };
    NodeDAO.prototype.insert = function (commitId, data, callback) {
        this.con.query('INSERT INTO node(this_node_id, description, node_type, commit_id) VALUES(?,?,?,?)', [
            data.ThisNodeId, 
            data.Description, 
            data.NodeType, 
            commitId
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };
    NodeDAO.prototype.insertList = function (dcaseId, commitId, list, callback) {
        var _this = this;
        if(list.length == 0) {
            callback(null);
            return;
        }
        this.processNodeList(dcaseId, commitId, list, function (err) {
            if(err) {
                callback(err);
                return;
            }
            _this.insert(commitId, list[0], function (err, nodeId) {
                if(err) {
                    callback(err);
                    return;
                }
                _this.insertList(dcaseId, commitId, list.slice(1), callback);
            });
        });
    };
    NodeDAO.prototype.search = function (page, query, callback) {
        var _this = this;
        var pager = new model_pager.Pager(page);
        query = '%' + query + '%';
        this.con.query({
            sql: 'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ORDER BY c.modified desc, c.id LIMIT ? OFFSET ? ',
            nestTables: true
        }, [
            query, 
            pager.limit, 
            pager.getOffset()
        ], function (err, result) {
            if(err) {
                callback(err, null, null);
                return;
            }
            var list = new Array();
            result.forEach(function (row) {
                var node = new Node(row.n.id, row.n.commit_id, row.n.this_node_id, row.n.node_type, row.n.description);
                node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
                list.push(node);
            });
            _this.con.query('SELECT count(d.id) as cnt from node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ', [
                query
            ], function (err, countResult) {
                if(err) {
                    callback(err, null, null);
                    return;
                }
                pager.totalItems = countResult[0].cnt;
                callback(err, pager, list);
            });
        });
    };
    return NodeDAO;
})(model.DAO);
exports.NodeDAO = NodeDAO;
