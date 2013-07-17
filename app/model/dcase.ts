import model = module('./model')
import model_commit = module('./commit')
import model_user = module('./user')
import model_pager = module('./pager');
import error = module('../api/error')
var async = require('async');
var _ = require('underscore');

export interface InsertArg {
	userId: number;
	dcaseName: string;
}
export class DCase {
	public user: model_user.User;
	public latestCommit: model_commit.Commit;
	constructor(public id:number, public name:string, public userId:number, public deleteFlag:bool) {
		this.deleteFlag = !!this.deleteFlag;
		if (deleteFlag === undefined) {
			this.deleteFlag = false;
		}
	}
	static tableToObject(table: any) {
		return new DCase(table.id, table.name, table.user_id, table.delete_flag);
	}
}
export class DCaseDAO extends model.DAO {
	get(id:number, callback: (err:any, dcase:DCase)=>void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM dcase WHERE id = ?', [id], (err:any, result:any) => next(err, result));
			},
			(result:any, next) => {
				if (result.length == 0)	{
					next(new error.NotFoundError('DCase is not found.', {id: id}));
					return;
				}
				next(null, DCase.tableToObject(result[0]));
			}
		], (err:any, dcase:DCase) => {
			callback(err, dcase);
		});
	}
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
	list(page: number, tagList:string[], callback: (err:any, summary: model_pager.Pager, list: DCase[])=>void): void {
		var pager = new model_pager.Pager(page);
		var query = {sql:'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified, c.id desc LIMIT ? OFFSET ? ' , nestTables:true};
		var params:any[] = [pager.limit, pager.getOffset()];
		if (tagList && tagList.length > 0) {
			var tagVars:string = _.map(tagList, (it:string) => {return '?'}).join(',');
			query.sql = 'SELECT * ' +
						'FROM dcase d, commit c, user u, user cu, tag t, dcase_tag_rel r ' +
						'WHERE d.id = c.dcase_id ' +
						'AND d.user_id = u.id ' +
						'AND c.user_id = cu.id ' +
						'AND t.id = r.tag_id  ' +
						'AND r.dcase_id = d.id ' +
						'AND c.latest_flag = TRUE ' +
						'AND d.delete_flag = FALSE ' +
						'AND t.label IN (' + tagVars + ') ' +
						'GROUP BY c.id ' +
						'HAVING COUNT(t.id) = ? ' +
						'ORDER BY c.modified, c.id desc LIMIT ? OFFSET ?';
			var tmp:any[] = tagList;
			params = tmp.concat([tagList.length]).concat(params);
		}
		this.con.query(query, params, (err, result) => {
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

		var countSQL = 'SELECT count(d.id) as cnt from dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ';
		var countParams:any[] = [];
		if (tagList && tagList.length > 0) {
			var tagVars:string = _.map(tagList, (it:string) => {return '?'}).join(',');
			query.sql = 'SELECT count(d.id) as cnt ' +
						'FROM dcase d, commit c, user u, user cu, tag t, dcase_tag_rel r ' +
						'WHERE d.id = c.dcase_id ' +
						'AND d.user_id = u.id ' +
						'AND c.user_id = cu.id ' +
						'AND t.id = r.tag_id  ' +
						'AND r.dcase_id = d.id ' +
						'AND c.latest_flag = TRUE ' +
						'AND d.delete_flag = FALSE ' +
						'AND t.label IN (' + tagVars + ') ' +
						'GROUP BY c.id ' +
						'HAVING COUNT(t.id) = ? ';
			var tmp:any[] = tagList;
			params = tmp.concat([tagList.length]).concat(params);
		}
			this.con.query(countSQL, params,(err, countResult) => {
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
