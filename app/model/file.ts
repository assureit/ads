import model = module('./model')
import domain = module('domain')
import error = module('../api/error')

export class FileDAO extends model.DAO {

	insert(name: string, userId: number, callback: (err: any, id: number) => void) {
		var path: string = "dummy";
		this.con.query('INSERT INTO file(name, path, user_id) VALUES(?,?,?) ', [name, path, userId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);

		});
	}

	update(id: number, path: string, callback: (err: any) => void) {
		this.con.query('UPDATE file SET path = ? where id = ?', [path, id], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);

		});


	}

	select(id: number, callback: (err: any, path: string, name: string) => void) {
		this.con.query('SELECT path, name from file where id = ?', [id], (err, result) => {
			if (err) {
				callback(err, null, null);
				return;
			}
			if (result.length == 0)
			{
				callback(new error.NotFoundError('The information on the target file was not found.'), null, null); 
				return;
			}
			callback(err, result[0].path, result[0].name);
		});
	} 

}
