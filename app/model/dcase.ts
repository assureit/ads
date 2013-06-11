import model = module('./model')

export interface InsertArg {
	userId: number;
	dcaseName: string;
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

	list(callback): void {
		this.con.query('SELECT * FROM dcase', (err, result) => {
			if (err) {
				this.con.close();
				throw err;
			}
			this.con.close();

			var list = [];
			result.forEach((val) => {
				list.push({dcaseId: val.id, dcaseName: val.name});
			});
			callback.onSuccess(list);
		});
	}
}