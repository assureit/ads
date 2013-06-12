var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var model_dcase = require('./dcase')
var model_pager = require('./pager')
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
        var _this = this;
        this.con.query('INSERT INTO node(this_node_id, description, node_type, commit_id) VALUES(?,?,?,?)', [
            data.ThisNodeId, 
            data.Description, 
            data.NodeType, 
            commitId
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            callback(result.insertId);
        });
    };
    NodeDAO.prototype.insertList = function (commitId, list, callback) {
        var _this = this;
        if(list.length == 0) {
            callback();
            return;
        }
        this.insert(commitId, list[0], function (nodeId) {
            _this.insertList(commitId, list.slice(1), callback);
        });
    };
    NodeDAO.prototype.search = function (query, callback) {
        var _this = this;
        var pager = new model_pager.Pager(0);
        this.con.query({
            sql: 'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? LIMIT ?',
            nestTables: true
        }, [
            '%' + query + '%', 
            pager.limit
        ], function (err, result) {
            if(err) {
                _this.con.rollback();
                _this.con.close();
                throw err;
            }
            var list = new Array();
            result.forEach(function (row) {
                var node = new Node(row.n.id, row.n.commit_id, row.n.this_node_id, row.n.node_type, row.n.description);
                node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
                list.push(node);
            });
            callback(list);
        });
    };
    return NodeDAO;
})(model.Model);
exports.NodeDAO = NodeDAO;
