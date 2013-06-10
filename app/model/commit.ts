import model = module('./model')

export interface InsertArg {
	data: string;
	prevId?: number;
	dcaseId: number;
	userId: number;
	message?: string;
}
export class Commit extends model.Model {
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
}

