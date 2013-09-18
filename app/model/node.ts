// <reference path="../DefinitelyTyped/underscore/underscore.d.ts" />

import model = module('./model')
import model_dcase = module('./dcase')
import model_pager = module('./pager')
import model_issue = module('./issue')
import model_tag = module('./tag')
import model_monitor = module('./monitor')
import error = module('../api/error')
import asn_parser = module('../util/asn-parser')
// import _ = module('underscore')
var _ = require('underscore');
var async = require('async');
var CONFIG = require('config');
var mstranslator = require('mstranslator');

/* obsolete */
export interface NodeNote {
	Name: string;
	Body: any;
}

export interface NodeData {
	Type: string;
	Label: string;
	Statement: string;
	Annotations:any;
	Children?: any[];
	Notes?: { [index: string]: string }; // change here !! ( NodeNote[] => { [index: string]: string } )
}
export class Node {
	public dcase: model_dcase.DCase;
	constructor(public id: number, public commitId: number, public thisNodeId: number, public nodeType: string, public description: string) {}
}
export class NodeDAO extends model.DAO {
	/**
	 * DCaseノード毎に事前処理を行う。
	 * 事前処理：
	 *   イシュー発行
	 *   モニタ作成
	 */
	// processNodeList(dcaseId:number, commitId:number, list: NodeData[], callback: (err:any)=>void): void {
	// 	this._processNodeList(dcaseId, commitId, list, list, callback);
	// }

	// _processNodeList(dcaseId:number, commitId:number, list: NodeData[], originalList:NodeData[], callback: (err:any)=>void): void {
	// 	if (list.length == 0) {
	// 		callback(null);
	// 		return;
	// 	}
	// 	this.processMetaDataList(dcaseId, commitId, list[0], list[0].MetaData, originalList, (err:any) => {
	// 		if (err) {
	// 			callback(err);
	// 			return;
	// 		}
	// 		this._processNodeList(dcaseId, commitId, list.slice(1), originalList, callback);
	// 	});
	// }

	// processMetaDataList(dcaseId:number, commitId:number, node:NodeData, list:MetaData[], originalList:NodeData[], callback: (err:any)=>void): void {
	// 	if (!list || list.length == 0) {
	// 		callback(null);
	// 		return;
	// 	}
	// 	this.processMetaData(dcaseId, commitId, node, list[0], originalList, (err:any) => {
	// 		if (err) {
	// 			callback(err);
	// 			return;
	// 		}
	// 		this.processMetaDataList(dcaseId, commitId, node, list.slice(1), originalList, callback);
	// 	});
	// }
	// processMetaData(dcaseId:number, commitId:number, node:NodeData, meta:MetaData, originalList:NodeData[], callback: (err:any)=>void): void {
		// if (meta.Type == 'Issue' && !meta._IssueId) {
		// 	var issueDAO = new model_issue.IssueDAO(this.con);
		// 	// TODO: 必要項目チェック
		// 	issueDAO.insert(new model_issue.Issue(0, dcaseId, null, meta.Subject, meta.Description), (err:any, result:model_issue.Issue) => {
		// 		if(err) {
		// 			callback(err);
		// 			return;					
		// 		}
		// 		meta._IssueId = result.id;
		// 		callback(null);
		// 	});
		// 	return;
		//} else if (meta.Type == 'Monitor') {
		//	// TODO: 必要項目チェック
		//	var monitorDAO = new model_monitor.MonitorDAO(this.con);
		//	var params = 
		//		_.reduce(
		//			_.filter(
		//				_.flatten(
		//					_.map(
		//						_.filter(originalList, (it:NodeData) => {
		//							return _.find(node.Children, (childId:number) => {return it.ThisNodeId == childId && it.NodeType == 'Context';});
		//						})
		//						, (it:NodeData) => {return it.MetaData;}))
		//				, (it: MetaData) => {return it.Type == 'Parameter';})
		//			, (param, it:MetaData) => {return _.extend(param, it);}, {});
		//	params = _.omit(params, ['Type', 'Visible']);

		//	async.waterfall([
		//		(next) => {
		//			monitorDAO.findByThisNodeId(dcaseId, node.ThisNodeId, (err:any, monitor:model_monitor.MonitorNode) => {
		//				if (err instanceof error.NotFoundError) {
		//					next(null, null);
		//				} else {
		//					next(err, monitor);
		//				}
		//			});
		//		},
		//		(monitor:model_monitor.MonitorNode, next: Function) => {
		//			if (monitor) {
		//				if (meta.WatchId != monitor.watchId
		//					|| meta.PresetId != monitor.presetId
		//					|| JSON.stringify(params) != JSON.stringify(monitor.params)) {

		//					monitor.watchId = meta.WatchId;
		//					monitor.presetId = meta.PresetId;
		//					monitor.params = params;
		//					monitor.publishStatus = model_monitor.PUBLISH_STATUS_UPDATED;
		//					monitorDAO.update(monitor, (err:any) => {
		//						if (!err) {
		//							meta._MonitorNodeId = monitor.id;
		//						}
		//						next(err);
		//					});
		//				} else {
		//					next(null);
		//				}
		//			} else {
		//				monitorDAO.insert(new model_monitor.MonitorNode(0, dcaseId, node.ThisNodeId, meta.WatchId, meta.PresetId, params), 
		//					(err:any, monitorId:number) => {
		//						if (!err) {
		//							meta._MonitorNodeId = monitorId;
		//						}
		//						next(err);
		//					});
		//			}
		//		}
		//	], (err:any) => {
		//		callback(err);
		//	});
		//	return;
	// 	} else {
	// 		callback(null);
	// 		return;
	// 	}
	// }
	insert(commitId: number, data: NodeData, callback: (err:any, nodeId: number)=>void): void {
		// TODO: node propertyをどうするべきか？TicketやMonitorに変更するべきか、meta.ticket1.id、meta.ticket1.nameなどとして並列にするか
		this.con.query('INSERT INTO node(description, node_type, commit_id) VALUES(?,?,?)', 
			[JSON.stringify(data), data.Type, commitId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);
		});
	}

	insertList(dcaseId:number, commitId: number, list: NodeData[], callback: (err:any)=> void): void {
		if (list.length == 0) {
			callback(null);
			return;
		}
		async.waterfall([
			// (next) => {
			// 	this.processNodeList(dcaseId, commitId, list, (err:any) => next(err));
			// },
			(next) => {
				this.registerTag(dcaseId, list, (err:any) => next(err));
			}],
			(err:any) => {
				if (err) {
					callback(err);
					return;
				}
				this._insertList(dcaseId, commitId, list, callback);
			}
		);
	}

	_insertList(dcaseId:number, commitId: number, list: NodeData[], callback: (err:any)=> void): void {
		if (list.length == 0) {
			callback(null);
			return;
		}
		async.waterfall([
			(next) => {
				this.insert(commitId, list[0], (err:any, nodeId: number) => next(err, nodeId));
			}],
			(err:any, nodeId) => {
				if (err) {
					callback(err);
					return;
				}
				this._insertList(dcaseId, commitId, list.slice(1), callback);
			}
		);
	}

	translate(dcaseId:number, commitId: number, model: any, callback: (err:any, asn: string)=> void): void {
		if (model == null || CONFIG.translator.CLIENT_ID.length == 0) {
			callback(null, null);
			return;
		}
		var CheckLength = function (str) {
			for (var i = 0; i < str.length; i++) {
				var c = str.charCodeAt(i);
				if ( !((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4))) {
					return true;
				}
			}
			return false;
		};
		var Translator = new mstranslator({client_id: CONFIG.translator.CLIENT_ID, client_secret: CONFIG.translator.CLIENT_SECRET});
		console.log("2");
		var items = [[], []];
		var traverse = (model) => {
			if (model.Statement != '' && CheckLength(model.Statement) && model.Notes['TranslatedTo'] == null) {
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
		}
		traverse(model);
		if (items[0].length == 0) {
			callback(null, null);
		}

		Translator.initialize_token(function(keys) {
			var param = {
				texts: items[1],
				to: "en"
			};
			Translator.translateArray(param, function(err, data) {
				if (err) {
					console.log(err);
					callback(null, null);
				}
				console.log(data);
				for (var i in items[0]) {
					var model_translated = items[0][i];
					if (model_translated.Annotations == '') {
						model_translated.Annotations = [{Name: 'en', Body: ''}];
					} else {
						model_translated.Annotations.push({Name: 'en', Body: ''});
					}
					model_translated.Notes["TranslatedTo"] = data[i]['TranslatedText'];
				}
				var parser = new asn_parser.ASNParser();
				var asn = parser.ConvertToASN(model, false);
				asn = asn.replace('\\n', '\n');
				asn = asn.replace('\\t', '\t');
				asn = asn.replace('\\r', '\r');
				console.log(asn);
				callback(null, asn);
			});
		});
	}

	/* obsolete */
	registerTag(dcaseId:number, list: NodeData[], callback: (err:any) => void) {
		var tagDAO = new model_tag.TagDAO(this.con);
		var tagList:string[] = _.map(_.filter(list, (node: NodeData) => {return node.Notes && node.Notes['Tag'];}), (node: NodeData) => {return node.Notes['Tag'];});
		tagList = _.uniq(_.flatten(_.map(tagList, (tag:string) => {return tag.split(',');})));
		async.waterfall([
			(next) => {
				tagDAO.replaceDCaseTag(dcaseId, tagList, (err:any)=> next(err));
			},
			], (err:any) => {
				callback(err);
			});
	}

	search(page: number, query: string, callback: (err:any, pager: model_pager.Pager, list: Node[]) => void) {
		// TODO: 全文検索エンジン対応
		var pager = new model_pager.Pager(page);
		query = '%' + query + '%';
		this.con.query({sql:'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ORDER BY c.modified desc, c.id LIMIT ? OFFSET ? ', nestTables:true}, 
			[query, pager.limit, pager.getOffset()], (err, result) => {
			if (err) {
				callback(err, null, null);
				return;
			}
			var list = new Array<Node>();
			result.forEach((row) => {
				var node = new Node(row.n.id, row.n.commit_id, row.n.this_node_id, row.n.node_type, row.n.description);
				node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.project_id, row.d.user_id, row.d.delete_flag, row.d.type);
				list.push(node);
			});

			this.con.query('SELECT count(d.id) as cnt from node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ', [query], (err, countResult) => {
				if (err) {
					callback(err, null, null);
					return;
				}
				pager.totalItems = countResult[0].cnt;
				callback(err, pager, list);
			});
		});
	}

	get(commitId: number, callback: (err:any, list:Node[]) => void) {
		this.con.query('SELECT * FROM node WHERE commit_id = ?', [commitId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			var list = new Array<Node>();
			result.forEach((row) => {
				var node = new Node(row.id, row.commit_id, row.this_node_id, row.node_type, row.description);
				list.push(node);
			});
			callback(err, list);
	
		});
	}

	getNode(commitId: number, thisNodeId: number,callback: (err:any, node:Node) => void) {
		this.con.query('SELECT * FROM node WHERE commit_id = ? AND this_node_id = ?', [commitId, thisNodeId], (err, result) => {
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
	}

}

