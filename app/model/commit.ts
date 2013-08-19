///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import model = module('./model')
import model_user = module('./user')
import model_node = module('../model/node')
import model_issue = module('../model/issue')
//import model_monitor = module('../model/monitor')
var async = require('async')

export interface InsertArg {
	data: string;
	prevId?: number;
	dcaseId: number;
	userId: number;
	message?: string;
}
export class Commit {
	public user: model_user.User;
	constructor(public id:number, public prevCommitId: number, public dcaseId: number, public userId: number, public message:string, public data:string, public dateTime: Date, public latestFlag: bool) {
		this.latestFlag = !!this.latestFlag;
	}
}
export class CommitDAO extends model.DAO {
	insert(params: InsertArg, callback: (err:any, commitId: number)=>void): void {
		params.prevId = params.prevId || 0;
		this.con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, `user_id`, `message`) VALUES(?,now(),?,TRUE,?,?,?)', 
			[params.data, params.prevId, params.dcaseId, params.userId, params.message], (err, result) => {
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
			result = result[0];
			callback(err, new Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
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
				var c = new Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
				c.user = new model_user.User(row.u.id, row.u.login_name, row.u.delete_flag, row.u.system_flag)
				list.push(c);
			});
			callback(err, list);
		});
	}


	commit(userId:number, previousCommitId:number, message: string, contents:any, commitCallback: (err:any, result:any)=>void) {
		async.waterfall([
			(callback) => {
				this.get(previousCommitId, (err:any, com: Commit) => {callback(err, com);});
			}
			, (com: Commit, callback) => {
				this.insert({data: JSON.stringify(contents), prevId: previousCommitId, dcaseId: com.dcaseId, userId: userId, message: message}, (err:any, commitId:number) => {callback(err, com, commitId);});
			}
			, (com: Commit, commitId: number, callback) => {
				var nodeDAO = new model_node.NodeDAO(this.con);
				nodeDAO.insertList(com.dcaseId, commitId, contents.NodeList, (err:any) => {callback(err, com, commitId);});
			}
			, (com: Commit, commitId: number, callback) => {
				this.update(commitId, JSON.stringify(contents), (err:any) => {callback(err, com, commitId);});
			}
			, (com: Commit, commitId: number, callback) => {
				var issueDAO = new model_issue.IssueDAO(this.con);
				issueDAO.publish(com.dcaseId, (err:any) => {
					callback(err, {commitId: commitId});
				});
//			} 
//			, (com: Commit, commitId: number, callback) => {
//				var monitorDAO = new model_monitor.MonitorDAO(this.con);
//				monitorDAO.publish(com.dcaseId, (err:any) => {
//					callback(err, {commitId: commitId});
//				});
			}
		], (err:any, result:any) => {
			if (err) {
				this.con.rollback();
			};
			commitCallback(err, result);
		});
	}
}

