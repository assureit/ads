var db = require('../db/db');










var async = require('async');
var _ = require('underscore');

function getMethodName(node) {
    return node.NodeType.slice(0, 1) + node.ThisNodeId;
}

function FindById(id, nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];
        var thisId = node.ThisNodeId;
        if (node.ThisNodeId == id) {
            return node;
        }
    }
    return null;
}

function generate(NodeList, Id) {
    var retText = "";
    var node = FindById(Id, NodeList);
    for (var i = 0; i < node.Children.length; i++) {
        retText += generate(NodeList, node.Children[i]);
    }
    if (node.MetaData == null) {
        return retText;
    }
    for (var j = 0; j < node.MetaData.length; j++) {
        var data = node.MetaData[j];
        if (data.Description == null) {
            continue;
        }
        if (data.Type == "Monitor" || data.Type == "Recovery" || data.Type == "Condition") {
            retText += '// ' + node.ThisNodeId + '\n';
            retText += "void " + getMethodName(node) + '_' + data.Type + '() {\n';
            retText += '    ' + data.Description.replace(/\n/g, '\n    ');
            retText += '\n}\n\n';
        }
    }
    return retText;
}

function exporter(req, res) {
    var con = new db.Database();

    con.query({ sql: 'SELECT * FROM dcase d, commit c WHERE d.id = c.dcase_id AND c.latest_flag=TRUE and d.id = ?', nestTables: true }, [req.params.id], function (err, result) {
        if (err) {
            con.close();
            throw err;
        }

        con.close();
        var c = result[0].c;
        var d = result[0].d;

        var json = {
            commitId: c.id,
            dcaseName: d.name,
            contents: JSON.parse(c.data)
        };

        var resText = generate(json.contents.NodeList, json.contents.TopGoalId);
        res.set('Content-type', 'text/plain; charset=utf-8');
        res.send(resText);
    });
}
exports.exporter = exporter;

