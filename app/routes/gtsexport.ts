///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import db = module('../db/db')
import type = module('../api/type')
import constant = module('../constant')
import model_dcase = module('../model/dcase')
import model_commit = module('../model/commit')
import model_node = module('../model/node')
import model_pager = module('../model/pager')
import model_issue = module('../model/issue')
import model_user = module('../model/user')
import model_tag = module('../model/tag')
import error = module('../api/error')
var async = require('async')
var _ = require('underscore');

export function exporter(req: any, res: any) {
	//res.send("id:"+ req.params.id + ", type:"+ req.params.type + ", n:"+ req.params.n);
	var con = new db.Database();

	con.query({sql: 'SELECT * FROM dcase d, commit c WHERE d.id = c.dcase_id AND c.latest_flag=TRUE and d.id = ?', nestTables: true}, [req.params.id], (err, result) => {
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
