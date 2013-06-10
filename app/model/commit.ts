import model = module('./model')

export interface InsertArg {
	data: string;
	prevId?: number;
	dcaseId: number;
	userId: number;
	message?: string;
}
export class Commit {
	constructor(public id:number, public prevCommitId: number, public dcaseId: number, public userId: number, public message:string, public data:string, public dateTime: Date, public latestFlag: bool) {}
}
export class CommitDAO extends model.Model {
	insert(params: InsertArg, callback: (commitId: number)=>void): void {
		params.prevId = params.prevId || 0;
		this.con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, `user_id`, `message`) VALUES(?,now(),?,TRUE,?,?,?)', 
			[params.data, params.prevId, params.dcaseId, params.userId, params.message], (err, result) => {
			if (err) {
				this.con.rollback();
				this.con.close();
				throw err;
			}
			callback(result.insertId);
		});
	}

	get(commitId: number, callback: (commit: Commit) => void) {
		this.con.query('SELECT * FROM commit WHERE commitId=?', [commitId], (err, result) => {
			if (err) {
				this.con.rollback();
				this.con.close();
				throw err;
			}
			console.log(result);
			callback(new Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
		});
	}
}

