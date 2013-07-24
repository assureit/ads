var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var model_dcase = require('./dcase');
var model_pager = require('./pager');
var model_issue = require('./issue');
var model_tag = require('./tag');
var model_monitor = require('./monitor');
var error = require('../api/error');

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
        if (list.length == 0) {
            callback(null);
            return;
        }
        this.processMetaDataList(dcaseId, commitId, list[0], list[0].MetaData, originalList, function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this._processNodeList(dcaseId, commitId, list.slice(1), originalList, callback);
        });
    };

    NodeDAO.prototype.processMetaDataList = function (dcaseId, commitId, node, list, originalList, callback) {
        var _this = this;
        if (!list || list.length == 0) {
            callback(null);
            return;
        }
        this.processMetaData(dcaseId, commitId, node, list[0], originalList, function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this.processMetaDataList(dcaseId, commitId, node, list.slice(1), originalList, callback);
        });
    };
    NodeDAO.prototype.processMetaData = function (dcaseId, commitId, node, meta, originalList, callback) {
        if (meta.Type == 'Issue' && !meta._IssueId) {
            var issueDAO = new model_issue.IssueDAO(this.con);

            issueDAO.insert(new model_issue.Issue(0, dcaseId, null, meta.Subject, meta.Description), function (err, result) {
                if (err) {
                    callback(err);
                    return;
                }
                meta._IssueId = result.id;
                callback(null);
            });
            return;
        } else if (meta.Type == 'Monitor') {
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
            }, {});
            params = _.omit(params, ['Type', 'Visible']);

            async.waterfall([
                function (next) {
                    monitorDAO.findByThisNodeId(dcaseId, node.ThisNodeId, function (err, monitor) {
                        if (err instanceof error.NotFoundError) {
                            next(null, null);
                        } else {
                            next(err, monitor);
                        }
                    });
                },
                function (monitor, next) {
                    if (monitor) {
                        if (meta.WatchId != monitor.watchId || meta.PresetId != monitor.presetId || JSON.stringify(params) != JSON.stringify(monitor.params)) {
                            monitor.watchId = meta.WatchId;
                            monitor.presetId = meta.PresetId;
                            monitor.params = params;
                            monitor.publishStatus = model_monitor.PUBLISH_STATUS_UPDATED;
                            monitorDAO.update(monitor, function (err) {
                                if (!err) {
                                    meta._MonitorNodeId = monitor.id;
                                }
                                next(err);
                            });
                        } else {
                            next(null);
                        }
                    } else {
                        monitorDAO.insert(new model_monitor.MonitorNode(0, dcaseId, node.ThisNodeId, meta.WatchId, meta.PresetId, params), function (err, monitorId) {
                            if (!err) {
                                meta._MonitorNodeId = monitorId;
                            }
                            next(err);
                        });
                    }
                }
            ], function (err) {
                callback(err);
            });
            return;
        } else {
            callback(null);
            return;
        }
    };
    NodeDAO.prototype.insert = function (commitId, data, callback) {
        this.con.query('INSERT INTO node(this_node_id, description, node_type, commit_id) VALUES(?,?,?,?)', [data.ThisNodeId, data.Description, data.NodeType, commitId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };

    NodeDAO.prototype.insertList = function (dcaseId, commitId, list, callback) {
        var _this = this;
        if (list.length == 0) {
            callback(null);
            return;
        }
        async.waterfall([
            function (next) {
                _this.processNodeList(dcaseId, commitId, list, function (err) {
                    return next(err);
                });
            },
            function (next) {
                _this.registerTag(dcaseId, list, function (err) {
                    return next(err);
                });
            }
        ], function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this._insertList(dcaseId, commitId, list, callback);
        });
    };

    NodeDAO.prototype._insertList = function (dcaseId, commitId, list, callback) {
        var _this = this;
        if (list.length == 0) {
            callback(null);
            return;
        }
        async.waterfall([
            function (next) {
                _this.insert(commitId, list[0], function (err, nodeId) {
                    return next(err, nodeId);
                });
            }
        ], function (err, nodeId) {
            if (err) {
                callback(err);
                return;
            }
            _this._insertList(dcaseId, commitId, list.slice(1), callback);
        });
    };

    NodeDAO.prototype.registerTag = function (dcaseId, list, callback) {
        var tagDAO = new model_tag.TagDAO(this.con);
        var metaDataList = _.flatten(_.map(list, function (node) {
            return node.MetaData;
        }));
        metaDataList = _.filter(metaDataList, function (meta) {
            return meta && meta.Type == 'Tag';
        });
        var tagList = _.uniq(_.filter((_.map(metaDataList, function (meta) {
            return meta.Tag;
        })), function (tag) {
            return typeof (tag) == 'string' && tag.length > 0;
        }));
        async.waterfall([
            function (next) {
                tagDAO.replaceDCaseTag(dcaseId, tagList, function (err) {
                    return next(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    };

    NodeDAO.prototype.search = function (page, query, callback) {
        var _this = this;
        var pager = new model_pager.Pager(page);
        query = '%' + query + '%';
        this.con.query({ sql: 'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ORDER BY c.modified desc, c.id LIMIT ? OFFSET ? ', nestTables: true }, [query, pager.limit, pager.getOffset()], function (err, result) {
            if (err) {
                callback(err, null, null);
                return;
            }
            var list = new Array();
            result.forEach(function (row) {
                var node = new Node(row.n.id, row.n.commit_id, row.n.this_node_id, row.n.node_type, row.n.description);
                node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
                list.push(node);
            });

            _this.con.query('SELECT count(d.id) as cnt from node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ', [query], function (err, countResult) {
                if (err) {
                    callback(err, null, null);
                    return;
                }
                pager.totalItems = countResult[0].cnt;
                callback(err, pager, list);
            });
        });
    };

    NodeDAO.prototype.get = function (commitId, callback) {
        this.con.query('SELECT * FROM node WHERE commit_id = ?', [commitId], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            var list = new Array();
            result.forEach(function (row) {
                var node = new Node(row.id, row.commit_id, row.this_node_id, row.node_type, row.description);
                list.push(node);
            });
            callback(err, list);
        });
    };

    NodeDAO.prototype.getNode = function (commitId, thisNodeId, callback) {
        this.con.query('SELECT * FROM node WHERE commit_id = ? AND this_node_id = ?', [commitId, thisNodeId], function (err, result) {
            if (err) {
                callback(err, null);
            }
            if (result.length > 0) {
                var node = new Node(result[0].id, result[0].commit_id, result[0].this_node_id, result[0].node_type, result[0].description);
                callback(err, node);
            } else {
                callback(err, null);
            }
            return;
        });
    };
    return NodeDAO;
})(model.DAO);
exports.NodeDAO = NodeDAO;

