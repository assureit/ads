import model = module('./model')

export interface InsertArg {
	userId: number;
	dcaseName: string;
}
export class DCase extends model.Model {
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
}