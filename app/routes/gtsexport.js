var db = require('../db/db');










var async = require('async');
var _ = require('underscore');

function getMethodName(node) {
    return node.NodeType.slice(0, 1) + node.ThisNodeId;
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

        var resText = "";
        console.log(json.contents.NodeList);
        for (var i = 0; i < json.contents.NodeList.length; i++) {
            var node = json.contents.NodeList[i];
            if (node.MetaData == null) {
                continue;
            }
            for (var j = 0; j < node.MetaData.length; j++) {
                var data = node.MetaData[j];
                console.log(data);
                if (data.Description == null) {
                    continue;
                }
                if (data.Type == "Monitor" || data.Type == "Recovery" || data.Type == "Condition") {
                    resText += '// ' + node.ThisNodeId + '\n';
                    resText += "void " + getMethodName(node) + '_' + data.Type + '() {\n';
                    resText += '    ' + data.Description.replace(/\n/g, '\n    ');
                    resText += '\n}\n\n';
                }
            }
        }
        res.send(resText);
    });
}
exports.exporter = exporter;

