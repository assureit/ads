import model = module('./model')
import error = module('../api/error')
var async = require('async');

export class Tag {
	constructor(public id:number, public label:string, public count?:number) {
	}
	static tableToObject(table: any) {
		return new Tag(table.id, table.label, table.cnt ? table.cnt : 0);
	}
}
export class TagDAO extends model.DAO {
	list(callback: (err:any, list: Tag[])=>void): void {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM (SELECT t.id, t.label, COUNT(t.id) as cnt FROM tag t, dcase_tag_rel r, dcase d WHERE t.id = r.tag_id AND d.id = r.dcase_id AND d.delete_flag = FALSE GROUP BY t.id, t.label) v ORDER BY v.cnt DESC', 
					(err:any, result:any) => {
						next(err, result);
				});
			},
			(result:any, next) => {
				var list:Tag[] = [];
				result.forEach((row) => {
					list.push(Tag.tableToObject(row));
				});
				next(null, list);
			}
		], (err:any, list: Tag[]) => {
			callback(err, list);
		})
	}
}
