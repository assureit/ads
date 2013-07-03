///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import model = module('./model')
import model_commit = module('./commit')
import error = module('../api/error')
import rec = module('../net/rec')
var async = require('async')

export interface InsertMonitor {
        dcaseId: number;
        thisNodeId: number;
        preSetId?: number;
        params?: string;
}

export class MonitorNode {
	constructor(public id:number, public dcaseId:number, public thisNodeId:number, public watchId:string, public presetId:string, public params:any, public rebuttalThisNodeId:number, public publishStatus:number) {}
	static tableToObject(table: any) {
		return new MonitorNode(table.id, table.dcase_id, table.this_node_id, table.watch_id, table.preset_id, table.params ? JSON.parse(table.params) : {}, table.rebuttal_this_node_id, table.publish_status);
	}
}

export class MonitorDAO extends model.DAO {

	insert(param: InsertMonitor, callback: (err: any, id: number) => void) {
		this.con.query('INSERT INTO monitor_node(dcase_id, this_node_id, preset_id, params) VALUES(?,?,?,?) ', 
				[param.dcaseId, param.thisNodeId , param.preSetId, param.params], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);

		});
	}

	update(id: number, rebuttal_id: number, callback: (err: any) => void) {
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
				callback(new error.NotFoundError('Specified id was not found. '), null, null, null); 
				return;
			}
			callback(err, result[0].dcase_id, result[0].this_node_id, result[0].rebuttal_this_node_id);
		});
	} 


	getLatestCommit(dcaseId: number, callback: (err: any, latestCommit: model_commit.Commit) => void) {
		this.con.query('SELECT * FROM commit WHERE dcase_id = ? AND latest_flag = TRUE', [dcaseId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('Specified dcase_id was not found. '), null); 
				return;
			}

			result = result[0];
			callback(err, new model_commit.Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
				
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
				this.con.query('UPDATE monitor_node SET publish_status=1 WHERE id=?', [monitor.id], (err:any, result:any) => {
					next(err);
				});
			}
		], (err:any) => {
			callback(err, monitor);
		});
	}

	listNotPublished(dcaseId: number, callback: (err:any, result:MonitorNode[]) => void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM monitor_node WHERE dcase_id=? AND publish_status != 1', [dcaseId], (err:any, result:any) => {
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
		var rec = new rec.Rec();
		var method:string = (monitor.publishStatus == 0) ? 'registMonitor' : 'updateMonitor';
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
