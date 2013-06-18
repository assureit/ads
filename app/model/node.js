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
    NodeDAO.prototype.insertList = function (commitId, list, callback) {
        var _this = this;
        if(list.length == 0) {
            callback(null);
            return;
        }
        this.insert(commitId, list[0], function (err, nodeId) {
            if(err) {
                callback(err);
                return;
            }
            _this.insertList(commitId, list.slice(1), callback);
        });
    };
    NodeDAO.prototype.search = function (page, query, callback) {
        var _this = this;
        var pager = new model_pager.Pager(page);
        query = '%' + query + '%';
        this.con.query({
            sql: 'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? LIMIT ? OFFSET ? ',
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
