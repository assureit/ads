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

function getMethodName(node: any): string {
	return node.NodeType.slice(0,1) + node.ThisNodeId;
}

function FindById(id: number, nodeList: any[]):any {
	for(var i: number = 0; i < nodeList.length; i++) {
		var node: any = nodeList[i];
		var thisId = node.ThisNodeId;
		if(node.ThisNodeId == id) {
			return node;
		}
	}
	return null;
}

function generate(NodeList: any[], Id: number): string {
	var retText = "";
	var node = FindById(Id,NodeList);
	for(var i: number = 0; i < node.Children.length; i++) {
		retText += generate(NodeList, node.Children[i]);
	}
	if(node.MetaData == null) {
		return retText;
	}
	for(var j:number = 0; j < node.MetaData.length; j++) {
		var data = node.MetaData[j];
		if(data.Description == null) {
			continue;
		}
		if(data.Type == "Monitor" || data.Type == "Recovery" || data.Type == "Condition") {
			retText += '// ' + node.ThisNodeId + '\n';
			retText += "void " + getMethodName(node) + '_' + data.Type+ '() {\n';
			retText += '    ' + data.Description.replace(/\n/g, '\n    ');
			retText += '\n}\n\n';
		}
	}
	return retText;
}

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

		var json = {
			commitId: c.id,
			dcaseName: d.name,
			contents: JSON.parse(c.data)
		};

		var resText = generate(json.contents.NodeList, json.contents.TopGoalId);
		res.send(resText);
	});
}

