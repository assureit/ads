var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var model_dcase = require('./dcase');
var model_pager = require('./pager');

var model_tag = require('./tag');



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
    NodeDAO.prototype.insert = function (commitId, data, callback) {
        this.con.query('INSERT INTO node(description, node_type, commit_id) VALUES(?,?,?)', [JSON.stringify(data), data.Type, commitId], function (err, result) {
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
        var noteList = _.flatten(_.map(list, function (node) {
            return node.Notes;
        }));
        noteList = _.filter(noteList, function (note) {
            return note && note.Body.Type == 'Tag';
        });
        var tagList = _.uniq(_.filter((_.map(noteList, function (note) {
            return note.Body.Tag;
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
                node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.project_id, row.d.user_id, row.d.delete_flag, row.d.type);
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

