import model = module('./model')
import model_commit = module('./commit')
import model_user = module('./user')
import model_pager = module('./pager');
import error = module('../api/error')
import constant = module('../constant')
var async = require('async');
var _ = require('underscore');

export interface InsertArg {
	userId: number;
	dcaseName: string;
	projectId?: number;
	type?: number;
}
export class DCase {
	public user: model_user.User;
	public latestCommit: model_commit.Commit;
	constructor(public id:number, public name:string, public projectId:number, public userId:number, public deleteFlag:bool, public type?:number) {
		this.deleteFlag = !!this.deleteFlag;
		if (deleteFlag === undefined) {
			this.deleteFlag = false;
		}
		if (this.type === undefined) {
			this.type = constant.CASE_TYPE_DEFAULT;
		}
	}
	static tableToObject(table: any) {
		return new DCase(table.id, table.name, table.project_id, table.user_id, table.delete_flag, table.type);
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
	getDetail(id:number, callback: (err:any, dcase:DCase)=>void) {
		async.waterfall([
			(next) => {
				this.con.query({sql: 'SELECT * FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag=TRUE and d.id = ?', nestTables: true}, [id], (err, result) => next(err, result));

			},
			(result:any, next) => {
				if (result.length == 0) {
					next(new error.NotFoundError('Effective DCase does not exist.', {id: id}));
					return;
				}
				var row = result[0];
				var dcase = DCase.tableToObject(row.d);
				dcase.user = model_user.User.tableToObject(row.u);
				dcase.latestCommit = model_commit.Commit.tableToObject(row.c);
				dcase.latestCommit.user = model_user.User.tableToObject(row.cu);
				next(null, dcase);
			}
			],
			(err:any, result:DCase) => {
				callback(err, result);
			}
		);
	}
	insert(params: InsertArg, callback: (err:any, dcaseId: number, projectId?: number)=>void): void {
		if(!params.projectId) {
			params.projectId = constant.SYSTEM_PROJECT_ID; //public
		}
		if (!params.type) {
			params.type = constant.CASE_TYPE_DEFAULT;
		}
		async.waterfall([
			(next) => {
				this.con.query('SELECT count(id) as cnt FROM project WHERE id = ?', [params.projectId], (err, result) => next(err, result));
			},
			(result:any, next) => {
				if(result[0].cnt == 0) {
					next(new error.NotFoundError('Project Not Found.', params));
					return;
				}
				this.con.query('INSERT INTO dcase(user_id, name, project_id, type) VALUES (?, ?, ?, ?)', [params.userId, params.dcaseName, params.projectId, params.type], (err, result) => next(err, result ? result.insertId : null));
			}
			], (err:any, dcaseId:number) => {
				callback(err, dcaseId, params.projectId);
			});
		// this.con.query('INSERT INTO dcase(user_id, name, project_id) VALUES (?, ?, ?)', [params.userId, params.dcaseName, params.projectId], (err, result) => {
		// 	if (err) {
		// 		callback(err, null);
		// 		return;
		// 	}
		// 	callback(err, result.insertId);
		// });
	}

	/**
	 * @param page 検索結果の取得対象ページ（1始まり）
	 */
	list(page: number, userId:number, projectId:number, tagList:string[], callback: (err:any, summary: model_pager.Pager, list: DCase[])=>void): void {
		var pager = new model_pager.Pager(page);
		var queryFrom = 'dcase d, commit c, user u, user cu, (SELECT DISTINCT p.* FROM project p, project_has_user pu WHERE p.id = pu.project_id AND p.delete_flag = FALSE AND (p.public_flag = TRUE OR pu.user_id = ?)) p ';
		var queryWhere = 'd.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE AND p.id = d.project_id ';
		var query = {sql:'' , nestTables:true};
		// var query = {sql:'SELECT * FROM dcase d, commit c, user u, user cu, (SELECT p.* FROM project p, project_has_user pu WHERE p.id = pu.project_id AND (p.public_flag = TRUE OR pu.user_id = ?)) p WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE AND p.id = d.project_id ORDER BY c.modified DESC, c.id desc LIMIT ? OFFSET ? ' , nestTables:true};
		// var params:any[] = [pager.limit, pager.getOffset()];
		var params:any[] = [];
		params.push(userId);
		if (projectId && projectId > 0) {
			queryWhere = queryWhere + 'AND p.id=? ';
			params.push(projectId);
		}
		if (tagList && tagList.length > 0) {
			var tagVars:string = _.map(tagList, (it:string) => {return '?'}).join(',');
			queryFrom = queryFrom + ', tag t, dcase_tag_rel r ';
			queryWhere = queryWhere +
						'AND t.id = r.tag_id  ' +
						'AND r.dcase_id = d.id ' +
						'AND t.label IN (' + tagVars + ') ' +
						'GROUP BY c.id ' +
						'HAVING COUNT(t.id) = ? ';
			// query.sql = 'SELECT * ' +
			// 			'FROM dcase d, commit c, user u, user cu, tag t, dcase_tag_rel r, (SELECT p.* FROM project p, project_has_user pu WHERE p.id = pu.project_id AND (p.public_flag = TRUE OR pu.user_id = ?)) p ' +
			// 			'WHERE d.id = c.dcase_id ' +
			// 			'AND d.user_id = u.id ' +
			// 			'AND c.user_id = cu.id ' +
			// 			'AND t.id = r.tag_id  ' +
			// 			'AND r.dcase_id = d.id ' +
			// 			'AND c.latest_flag = TRUE ' +
			// 			'AND d.delete_flag = FALSE ' +
			// 			'AND p.id = d.project_id ' +
			// 			'AND t.label IN (' + tagVars + ') ' +
			// 			'GROUP BY c.id ' +
			// 			'HAVING COUNT(t.id) = ? ' +
			// 			'ORDER BY c.modified, c.id desc LIMIT ? OFFSET ?';
			var tmp:any[] = tagList;
			params = params.concat(tmp).concat([tagList.length]);
		}
		query.sql = 'SELECT * FROM ' + queryFrom + 'WHERE ' + queryWhere + 'ORDER BY c.modified DESC, c.id desc LIMIT ? OFFSET ?';
		// console.log(query.sql);
		this.con.query(query, params.concat([pager.limit, pager.getOffset()]), (err, result) => {
			if (err) {
				callback(err, null, null);
				return;
			}

			var list = new Array<DCase>();
			result.forEach((row) => {
				var d = DCase.tableToObject(row.d);//new DCase(row.d.id, row.d.name, row.d.project_id, row.d.user_id, row.d.delete_flag, row.d.type);
				d.user = model_user.User.tableToObject(row.u);
				d.latestCommit = model_commit.Commit.tableToObject(row.c);
				d.latestCommit.user = model_user.User.tableToObject(row.cu);
				list.push(d);
			});

		// var countSQL = 'SELECT count(d.id) as cnt from dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ';
		// var countParams:any[] = [];
		// if (tagList && tagList.length > 0) {
		// 	var tagVars:string = _.map(tagList, (it:string) => {return '?'}).join(',');
		// 	countSQL = 'SELECT count(d.id) as cnt ' +
		// 				'FROM dcase d, commit c, user u, user cu, tag t, dcase_tag_rel r ' +
		// 				'WHERE d.id = c.dcase_id ' +
		// 				'AND d.user_id = u.id ' +
		// 				'AND c.user_id = cu.id ' +
		// 				'AND t.id = r.tag_id  ' +
		// 				'AND r.dcase_id = d.id ' +
		// 				'AND c.latest_flag = TRUE ' +
		// 				'AND d.delete_flag = FALSE ' +
		// 				'AND t.label IN (' + tagVars + ') ' +
		// 				'GROUP BY c.id ' +
		// 				'HAVING COUNT(t.id) = ? ';
		// 	var tmp:any[] = tagList;
		// 	countParams = tmp.concat([tagList.length]);
		// }
			// this.con.query(countSQL, countParams,(err, countResult) => {
			this.con.query('SELECT count(d.id) as cnt FROM ' + queryFrom + 'WHERE ' + queryWhere, params,(err, countResult) => {
				if (err) {
					callback(err, null, null);
					return;
				}
				pager.totalItems = 0;
				if (countResult.length > 0) {
					pager.totalItems = countResult[0].cnt;
				}
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
