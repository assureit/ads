var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
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
    return NodeDAO;
})(model.Model);
exports.NodeDAO = NodeDAO;
