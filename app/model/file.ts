import model = module('./model')
import domain = module('domain')
import error = module('../api/error')
var async = require('async');

export class File {
	constructor(public id:number, public name:string, public path:string, public userId:number) {}
	static tableToObject(table:any) {
		return new File(table.id, table.name, table.path, table.user_id);
	}
	static encodePath(path: string) {
		return encodeURI(path.replace(' ', '-'));
	}

	getEncodeName(): string {
		return File.encodePath(this.name);
	}
}
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

	get(id: number, callback: (err: any, file:File) => void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * from file where id = ?', [id], (err, result) => next(err, result));
			}, 
			(result:any, next) => {
				if (result.length == 0)	{
					next(new error.NotFoundError('The information on the target file was not found.'), null); 
					return;
				}
				next(null, File.tableToObject(result[0]));
			}
		], (err:any, file:File) => {
			callback(err, file);
		});
	} 

}
