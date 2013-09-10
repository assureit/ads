///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import model = module('./model')
import model_commit = module('./commit')
import error = module('../api/error')
import net_rec = module('../net/rec')
var async = require('async')

// export interface InsertMonitor {
//         dcaseId: number;
//         thisNodeId: number;
//         preSetId?: number;
//         params?: string;
// }

export var PUBLISH_STATUS_NONE = 0;
export var PUBLISH_STATUS_PUBLISHED = 1;
export var PUBLISH_STATUS_UPDATED = 2;

export class MonitorNode {
	constructor(public id:number, public dcaseId:number, public thisNodeId:number, public watchId:string, public presetId:string, public params:any, public rebuttalThisNodeId?:number, public publishStatus?:number, public deleteFlag?:bool) {
		if (!this.publishStatus) this.publishStatus = PUBLISH_STATUS_NONE;
		if (!this.params) this.params = {};
		this.deleteFlag = !!this.deleteFlag;
		if (this.deleteFlag === undefined) {
			this.deleteFlag = false;
		}
	}
	static tableToObject(table: any) {
		return new MonitorNode(table.id, table.dcase_id, table.this_node_id, table.watch_id, table.preset_id, table.params ? JSON.parse(table.params) : {}, table.rebuttal_this_node_id, table.publish_status, table.delete_flag);
	}
}

export class MonitorDAO extends model.DAO {
	get(id:number, callback:(err:any, monitor:MonitorNode)=>void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM monitor_node WHERE id=?', [id], (err:any, result:any) => {
					next(err, result);
				});
			}
			, (result:any, next) => {
				// TODO: NotFoundErrorチェック
				if (result.length == 0) {
					next(new error.NotFoundError('The monitor node was not found. [ID: ' + id + ']')); 
					return;
				}
				var monitor = MonitorNode.tableToObject(result[0]);
				next(null, monitor);
			}
		], (err:any, monitor:MonitorNode) => {
			callback(err, monitor);
		});
	}
	findByThisNodeId(dcaseId:number, thisNodeId:number, callback:(err:any, monitor:MonitorNode)=>void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM monitor_node WHERE dcase_id=? AND this_node_id=?', [dcaseId, thisNodeId], (err:any, result:any) => {
					next(err, result);
				});
			}
			, (result:any, next) => {
				if (result.length == 0) {
					next(new error.NotFoundError('The monitor node was not found. [DCase ID: ' + dcaseId + ', This_Node_Id: ' + thisNodeId + ']')); 
					return;
				}
				var monitor = MonitorNode.tableToObject(result[0]);
				next(null, monitor);
			}
		], (err:any, monitor:MonitorNode) => {
			callback(err, monitor);
		});
	}
	insert(monitor: MonitorNode, callback: (err: any, id: number) => void) {
		async.waterfall([
			(next) => {
				this.con.query('INSERT INTO monitor_node (dcase_id, this_node_id, watch_id, preset_id, params) VALUES(?,?,?,?,?)', 
						[monitor.dcaseId, monitor.thisNodeId , monitor.watchId, monitor.presetId, JSON.stringify(monitor.params)], (err:any, result:any) => {
					next(err, result);
				});
			}
		], (err:any, result:any) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);
		});
	}
	update(monitor: MonitorNode, callback: (err: any) => void) {
		async.waterfall([
			(next) => {
				this.con.query('UPDATE monitor_node SET dcase_id=?, this_node_id=?, watch_id=?, preset_id=?, params=?, rebuttal_this_node_id=?, publish_status=?, delete_flag=? WHERE id=?', 
						[monitor.dcaseId, monitor.thisNodeId , monitor.watchId, monitor.presetId, JSON.stringify(monitor.params), monitor.rebuttalThisNodeId, monitor.publishStatus, monitor.deleteFlag, monitor.id], (err:any, result:any) => {
					next(err);
				});
			}
		], (err:any) => {
			callback(err);
		});
	}
	// insert(param: InsertMonitor, callback: (err: any, id: number) => void) {
	// 	this.con.query('INSERT INTO monitor_node(dcase_id, this_node_id, preset_id, params) VALUES(?,?,?,?) ', 
	// 			[param.dcaseId, param.thisNodeId , param.preSetId, param.params], (err, result) => {
	// 		if (err) {
	// 			callback(err, null);
	// 			return;
	// 		}
	// 		callback(err, result.insertId);

	// 	});
	// }

	setRebuttalThisNodeId(id: number, rebuttal_id: number, callback: (err: any) => void) {
		this.con.query('UPDATE monitor_node  SET rebuttal_this_node_id = ? where id = ?', [rebuttal_id, id], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);

		});


	}

	select(id: number, callback: (err: any, dcaseId: number, thisNodeId: number, rebuttalThisNodeId: number) => void) {
		this.con.query('SELECT dcase_id, this_node_id, rebuttal_this_node_id  from monitor_node where id = ?', [id], (err, result) => {
			if (err) {
				callback(err, null, null, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('Specified id was not found. [id: ' + id + ']'), null, null, null); 
				return;
			}
			callback(err, result[0].dcase_id, result[0].this_node_id, result[0].rebuttal_this_node_id);
		});
	} 


	getLatestCommit(dcaseId: number, callback: (err: any, latestCommit: model_commit.Commit) => void) {
		this.con.query('SELECT * FROM commit WHERE dcase_id = ? AND latest_flag = TRUE ORDER BY id desc', [dcaseId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('Specified dcase_id was not found. '), null); 
				return;
			}

			result = result[0];
			callback(err, model_commit.Commit.tableToObject(result));
				
		});
	}

	getItsId(issueId: number, callback: (err: any, itsId: string) => void) {
		this.con.query('SELECT its_id FROM issue WHERE id = ?', [issueId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('ITSID was not found.'), null);
				return;
			}
			callback(err, result[0].its_id);	

		});
	}

	updatePublished(monitor:MonitorNode, callback: (err:any, updated: MonitorNode) => void) {
		async.waterfall([
			(next) => {
				this.con.query('UPDATE monitor_node SET publish_status=? WHERE id=?', [PUBLISH_STATUS_PUBLISHED, monitor.id], (err:any, result:any) => {
					next(err);
				});
			}
		], (err:any) => {
			callback(err, monitor);
		});
	}

	list(callback: (err:any, result:MonitorNode[]) => void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM monitor_node where delete_flag = false', (err:any, result:any) => {
					next(err, result);
				});
			}
			,(result:any, next) => {
				var list = [];
				result.forEach((it:any) => {
					list.push(MonitorNode.tableToObject(it));
				});
				next(null, list);
			}
		], (err:any, list:MonitorNode[]) => {
			callback(err,list);
		});

	}


	listNotPublished(dcaseId: number, callback: (err:any, result:MonitorNode[]) => void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM monitor_node WHERE dcase_id=? AND publish_status != ?', [dcaseId, PUBLISH_STATUS_PUBLISHED], (err:any, result:any) => {
					next(err, result);
				});
			}
			, (result:any, next) => {
				var list = [];
				result.forEach((it:any) => {
					list.push(MonitorNode.tableToObject(it));
				});
				next(null, list);
			}
		], (err:any, list:MonitorNode[]) => {
			callback(err, list);
		});
	}

	publish(dcaseId: number, callback: (err:any) => void) {
		// async.waterfall([
		// 	(next) => {
		// 		this.get(previousCommitId, (err:any, com: Commit) => {callback(err, com);});
		// 	}
		// 	, (com: Commit, callback) => {
		// 		this.insert({data: JSON.stringify(contents), prevId: previousCommitId, dcaseId: com.dcaseId, userId: userId, message: message}, (err:any, commitId:number) => {callback(err, com, commitId);});
		// 	}
		// 	, (com: Commit, commitId: number, callback) => {
		// 		var nodeDAO = new model_node.NodeDAO(this.con);
		// 		nodeDAO.insertList(com.dcaseId, commitId, contents.NodeList, (err:any) => {callback(err, com, commitId);});
		// 	}
		// 	, (com: Commit, commitId: number, callback) => {
		// 		this.update(commitId, JSON.stringify(contents), (err:any) => {callback(err, com, commitId);});
		// 	} 
		// 	, (com: Commit, commitId: number, callback) => {
		// 		var issueDAO = new model_issue.IssueDAO(this.con);
		// 		issueDAO.publish(com.dcaseId, (err:any) => {
		// 			callback(err, {commitId: commitId});
		// 		});
		// 	} 
		// ], (err:any, result:any) => {
		// 	commitCallback(err, result);
		// });

		this.listNotPublished(dcaseId, (err:any, list:MonitorNode[]) => {
			if(err) {
				callback(err);
				return;
			}
			this._publish(list, callback);
		});
	}

	_publish(list:MonitorNode[], callback: (err:any) => void) {
		if (!list || list.length == 0) {
			callback(null);
			return;
		}
		var monitor = list[0];
		var rec = new net_rec.Rec();
		var method:string = (monitor.publishStatus == PUBLISH_STATUS_NONE) ? 'registMonitor' : 'updateMonitor';
		rec.request(method, 
				{
					nodeID: monitor.id, 
					name: 'DCase: ' + monitor.dcaseId + ' Node: ' + monitor.thisNodeId, 
					watchID: monitor.watchId,
					presetID: monitor.presetId,
					params: monitor.params
				}, (err:any, result:any) => {
			if(err) {
				callback(err);
				return;
			}
			monitor.publishStatus = 1;
			this.updatePublished(monitor, (err:any, updated:MonitorNode) => {
				if(err) {
					callback(err);
					return;
				}
				this._publish(list.slice(1), callback);
			});
		});
	}
}
