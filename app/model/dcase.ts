import model = module('./model')
import model_commit = module('./commit')
import model_user = module('./user')

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
export class DCaseDAO extends model.Model {
	insert(params: InsertArg, callback: (dcaseId: number)=>void): void {
		this.con.query('INSERT INTO dcase(user_id, name) VALUES (?, ?)', [params.userId, params.dcaseName], (err, result) => {
			if (err) {
				this.con.rollback();
				this.con.close();
				throw err;
			}
			callback(result.insertId);
		});
	}

	list(callback: (list: DCase[])=>void): void {
		this.con.query({sql:'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = 1 AND d.delete_flag = FALSE', nestTables:true}, [], (err, result) => {
			if (err) {
				this.con.close();
				throw err;
			}

			var list = new DCase[];
			result.forEach((row) => {
				var d = new DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
				d.user = new model_user.User(row.u.id, row.u.name, row.u.delete_flag, row.u.system_flag);
				d.latestCommit = new model_commit.Commit(row.c.id, row.c.prev_commit_id, row.c.dcase_id, row.c.user_id, row.c.message, row.c.data, row.c.date_time, row.c.latest_flag);
				d.latestCommit.user = new model_user.User(row.cu.id, row.cu.name, row.cu.delete_flag, row.cu.system_flag);
				list.push(d);
			});
			callback(list);
		});
	}
}