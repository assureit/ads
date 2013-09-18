///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import model = module('./model')
import model_user = module('./user')
import model_node = module('../model/node')
import model_issue = module('../model/issue')
import asn_parser = module('../util/asn-parser')
import error = module('../api/error')
//import model_monitor = module('../model/monitor')
var async = require('async')

export interface InsertArg {
	data: string;
	metaData?: string;
	prevId?: number;
	dcaseId: number;
	userId: number;
	message?: string;
}
export class Commit {
	public user: model_user.User;
	constructor(public id:number, public prevCommitId: number, public dcaseId: number, public userId: number, public message:string, public metaData:string, public data:string, public dateTime: Date, public latestFlag: bool) {
		this.latestFlag = !!this.latestFlag;
	}
	static tableToObject(row:any) {
		return new Commit(row.id, row.prev_commit_id, row.dcase_id, row.user_id, row.message, row.meta_data, row.data, row.date_time, row.latest_flag);
	}
}
export class CommitDAO extends model.DAO {
	insert(params: InsertArg, callback: (err:any, commitId: number)=>void): void {
		params.prevId = params.prevId || 0;
		if (params.metaData === null || params.metaData === undefined) params.metaData = '';
		this.con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, user_id, meta_data, message) VALUES(?,now(),?,TRUE,?,?,?,?)', 
			[params.data, params.prevId, params.dcaseId, params.userId, params.metaData, params.message], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			this._clearLastUpdateFlag(params.dcaseId, result.insertId, (err) => {
				if (err) {
					callback(err, null);
				}
				callback(err, result.insertId);
			});
		});
	}

	update(id:number, data: string, callback: (err:any) => void): void {
		this.con.query('UPDATE commit SET data=? WHERE id=?', [data, id], (err, result) => {
			callback(err);
		});
	}

	_clearLastUpdateFlag(dcaseId: number, latestCommitId: number, callback: (err:any)=>void): void {
		this.con.query('UPDATE commit SET latest_flag = FALSE WHERE dcase_id = ? AND id <> ? AND latest_flag = TRUE', [dcaseId, latestCommitId], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);
		});
	}

	get(commitId: number, callback: (err:any, commit: Commit) => void):void {
		this.con.query('SELECT * FROM commit WHERE id=?', [commitId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('Effective Commit does not exist.', {commitId: commitId}), null);
				return;
			}
			result = result[0];
			callback(err, Commit.tableToObject(result));
		});
	}

	list(dcaseId: number, callback: (err:any, list: Commit[]) => void): void {
		this.con.query({sql: 'SELECT * FROM commit c, user u WHERE c.user_id = u.id AND c.dcase_id = ? ORDER BY c.id', nestTables: true}, [dcaseId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}

			var list = new Array<Commit>();
			result.forEach((row) => {
				var c = Commit.tableToObject(row.c);
				c.user = model_user.User.tableToObject(row.u);
				list.push(c);
			});
			callback(err, list);
		});
	}


	commit(userId:number, previousCommitId:number, message: string, metaData:string, contents:string, commitCallback: (err:any, result:any)=>void) {
		if (metaData === null || metaData === undefined) metaData = '';
		async.waterfall([
			(callback) => {
				this.get(previousCommitId, (err:any, com: Commit) => {callback(err, com);});
			}
			, (com: Commit, callback) => {
				this.insert({data: contents, metaData: metaData, prevId: previousCommitId, dcaseId: com.dcaseId, userId: userId, message: message}, (err:any, commitId:number) => {callback(err, com, commitId);});
			}
			, (com: Commit, commitId: number, callback) => {
				var parser = new asn_parser.ASNParser();
				var nodes = null;
				try {
					nodes = parser.parseNodeList(contents);
				} catch (e) {
					callback(e);
					return;
				}
				var nodeDAO = new model_node.NodeDAO(this.con);
				nodeDAO.insertList(com.dcaseId, commitId, nodes, (err:any) => {callback(err, com, commitId);});
			}, (com: Commit, commitId: number, callback) => {
				var parser = new asn_parser.ASNParser();
				var nodemodel = null;
				try {
					nodemodel = parser.parse(contents);
				} catch (e) {
					callback(e);
					return;
				}
				var nodeDAO = new model_node.NodeDAO(this.con);
				nodeDAO.translate(com.dcaseId, commitId, nodemodel, (err:any, asn: string) => {
					contents = asn;
					callback(err, com, commitId);
				});
			} , (com: Commit, commitId: number, callback) => {
				// this.update(commitId, JSON.stringify(contents), (err:any) => {callback(err, com, commitId);});
				this.update(commitId, contents, (err:any) => callback(err, {commitId: commitId}));
			}
			// , (com: Commit, commitId: number, callback) => {
			// 	var issueDAO = new model_issue.IssueDAO(this.con);
			// 	issueDAO.publish(com.dcaseId, (err:any) => {
			// 		callback(err, {commitId: commitId});
			// 	});
//			} 
//			, (com: Commit, commitId: number, callback) => {
//				var monitorDAO = new model_monitor.MonitorDAO(this.con);
//				monitorDAO.publish(com.dcaseId, (err:any) => {
//					callback(err, {commitId: commitId});
//				});
			// }
		], (err:any, result:any) => {
			if (err) {
				this.con.rollback();
			};
			commitCallback(err, result);
		});
	}
}

