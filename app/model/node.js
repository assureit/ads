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


var asn_parser = require('../util/asn-parser');

var _ = require('underscore');
var async = require('async');
var CONFIG = require('config');
var mstranslator = require('mstranslator');

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

    NodeDAO.prototype.translate = function (dcaseId, commitId, model, callback) {
        if (model == null || CONFIG.translator.CLIENT_ID.length == 0) {
            callback(null, null);
            return;
        }
        var CheckLength = function (str) {
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                if (!((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4))) {
                    return true;
                }
            }
            return false;
        };
        var Translator = new mstranslator({ client_id: CONFIG.translator.CLIENT_ID, client_secret: CONFIG.translator.CLIENT_SECRET });
        var items = [[], []];
        var traverse = function (model) {
            if (model.Statement != '' && CheckLength(model.Statement) && model.Notes['TranslatedTextEn'] == null) {
                model.Statement = model.Statement.replace('\n', '\\n');
                model.Statement = model.Statement.replace('\t', '\\t');
                model.Statement = model.Statement.replace('\r', '\\r');
                items[0].push(model);
                items[1].push(model.Statement);
            }
            for (var i in model.Children) {
                if (model.Children[i] != '') {
                    traverse(model.Children[i]);
                }
            }
        };
        traverse(model);
        if (items[0].length == 0) {
            callback(null, null);
            return;
        }

        Translator.initialize_token(function (keys) {
            var param = {
                texts: items[1],
                to: "en"
            };
            Translator.translateArray(param, function (err, data) {
                if (err) {
                    console.log(err);
                    callback(null, null);
                }
                for (var i in items[0]) {
                    var model_translated = items[0][i];
                    model_translated.Notes['TranslatedTextEn'] = data[i]['TranslatedText'];
                }
                var parser = new asn_parser.ASNParser();
                var asn = parser.ConvertToASN(model, false);
                asn = asn.replace('\\n', "\n");
                asn = asn.replace('\\t', "\t");
                asn = asn.replace('\\r', "\r");
                console.log('---- SUCCESSFULLY TRANSLATED ----');
                console.log(asn);
                callback(null, asn);
            });
        });
    };

    NodeDAO.prototype.registerTag = function (dcaseId, list, callback) {
        var tagDAO = new model_tag.TagDAO(this.con);
        var tagList = _.map(_.filter(list, function (node) {
            return node.Notes && node.Notes['Tag'];
        }), function (node) {
            return node.Notes['Tag'];
        });
        tagList = _.uniq(_.flatten(_.map(tagList, function (tag) {
            return tag.split(',');
        })));
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

