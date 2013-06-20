import model = module('./model')
import domain = module('domain')
import error = module('../api/error')

export class FileDAO extends model.DAO {

	insert(name: string, userId: number, callback: (err:any, id: number) => void) {
console.log(name);
console.log(userId);
		var path: string = "dummy";
		this.con.query('INSERT INTO file(name, path, user_id) VALUES(?,?,?) ', [name, path, userId], (err, result) => {
console.log(err);
			if (err) {
				callback(err, null);
				return;
			}
console.log('file:ccc');
			callback(err, 1);

		});
	}
}
