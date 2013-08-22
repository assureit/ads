var db = require('../db/db');










var async = require('async');
var _ = require('underscore');

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
        res.send({
            commitId: c.id,
            dcaseName: d.name,
            contents: c.data
        });
    });
}
exports.exporter = exporter;

