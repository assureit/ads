import model = module('./model')
import model_commit = module('./commit')
import model_user = module('./user')
import model_pager = module('./pager');

export interface InsertArg {
	userId: number;
	dcaseName: string;
}
export class DCase {
	public user: model_user.User;
	public latestCommit: model_commit.Commit;
	constructor(public id:number, public name:string, public userId:number, public deleteFlag:bool) {
		if (deleteFlag === undefined) {
			this.deleteFlag = false;
		}
	}
}
export class DCaseDAO extends model.DAO {
	insert(params: InsertArg, callback: (err:any, dcaseId: number)=>void): void {
		this.con.query('INSERT INTO dcase(user_id, name) VALUES (?, ?)', [params.userId, params.dcaseName], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);
		});
	}

	/**
	 * @param page 検索結果の取得対象ページ（1始まり）
	 */
	list(page: number, callback: (err:any, summary: model_pager.Pager, list: DCase[])=>void): void {
		var pager = new model_pager.Pager(page);
		this.con.query({sql:'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified, c.id desc LIMIT ? OFFSET ? ' , nestTables:true}, 
			[pager.limit, pager.getOffset()], (err, result) => {
			if (err) {
				callback(err, null, null);
				return;
			}

			var list = new DCase[];
			result.forEach((row) => {
				var d = new DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
				d.user = new model_user.User(row.u.id, row.u.login_name, row.u.delete_flag, row.u.system_flag);
				d.latestCommit = new model_commit.Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
				d.latestCommit.user = new model_user.User(row.cu.id, row.cu.login_name, row.cu.delete_flag, row.cu.system_flag);
				list.push(d);
			});

			this.con.query('SELECT count(d.id) as cnt from dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ',(err, countResult) => {
				if (err) {
					callback(err, null, null);
					return;
				}
				pager.totalItems = countResult[0].cnt;
				callback(err, pager, list);
			}); 

		});
	}



	remove(dcaseId: number, callback: (err:any)=>void) {
		this.con.query('UPDATE dcase SET delete_flag=TRUE WHERE id = ?', [dcaseId], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);
		});
	}

	update(dcaseId: number, name: string, callback: (err:any)=>void) {
		this.con.query('UPDATE dcase SET name=? WHERE id = ?', [name, dcaseId], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);
		});
	}
}
