import model = module('./model')
import domain = module('domain')
import error = module('../api/error')

export class FileDAO extends model.DAO {

	insert(name: string, userId: number, callback: (err:any, id: number) => void) {
		var path: string = "dummy";
		this.con.query('INSERT INTO file(name, path, user_id) VALUES(?,?,?) ', [name, path, userId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);

		});
	}

	update(id: number, path: string, callback: (err:any) => void) {
		this.con.query('UPDATE file SET path = ? where id = ?', [path, id], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);

		});


	}

}
