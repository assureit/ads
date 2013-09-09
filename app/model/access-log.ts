///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import model = module('./model')
var async = require('async')

export var TYPE_GET_DCASE = 'getDCase';
export var TYPE_GET_NODE_TREE = 'getNodeTree';

export class AccessLog {
	constructor(public id:number, public commitId: number, public userId: number, public accessType: string, public accessed:Date) {
	}
	static tableToObject(row:any) {
		return new AccessLog(row.id, row.commit_id, row.user_id, row.access_type, row.accessed);
	}
}
export class AccessLogDAO extends model.DAO {
	insert(commitId: number, userId: number, accessType:string, callback: (err:any)=>void): void {
		async.waterfall([
			(next) => {
				this.con.query('INSERT INTO access_log(commit_id, user_id, access_type, accessed) VALUES(?,?,?,now())', 
					[commitId, userId, accessType], (err, result) => next(err));
			}
		], (err:any) => {
			callback(err);
		});
	}
}

