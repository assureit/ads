import model = module('./model')
import error = module('../api/error')
var async = require('async');
var _ = require('underscore');

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

	/**
	 * 検索結果のDCaseとひもづくタグの配列を取得する.
	 * 参照: model.dcase.DCaseDAO#list
	 */
	search(tagList:string[], callback:(err:any, list: Tag[])=>void) {
		if (!tagList || tagList.length == 0) {
			this.list(callback);
			return;
		}
		async.waterfall([
			(next) => {
				var tagVars = _.map(tagList, (tag:string)=>{return '?';}).join(',');
				var sql = 'SELECT id, label, COUNT(id) as cnt FROM ( ' +
							'SELECT t2.* ' +
							'FROM dcase d, commit c, tag t, dcase_tag_rel r, dcase_tag_rel r2, tag t2 ' +
							'WHERE d.id = c.dcase_id  ' +
							'AND t.id = r.tag_id   ' +
							'AND r.dcase_id = d.id ' +
							'AND r2.dcase_id = d.id ' +
							'AND r2.tag_id = t2.id ' +
							'AND c.latest_flag = TRUE  ' +
							'AND d.delete_flag = FALSE  ' +
							'AND t.label IN (' + tagVars + ') ' +
							'GROUP BY c.id, t2.id ' +
							'HAVING COUNT(t.id) = 2 ' +
							') v ' +
							'GROUP BY id ' +
							'ORDER BY cnt DESC, id ';
				this.con.query(sql, tagList, (err:any, result:any) => {
						// console.log(sql);
						// console.log(tagList);
						// console.log(result);
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

	insert(label: string, callback: (err:any, tagId:number)=>void) {
		async.waterfall([
			(next) => {
				this.con.query('INSERT INTO tag(label) VALUES(?)', [label], (err:any, result:any) => {
						next(err, result);
				});
			},
		], (err:any, result:any) => {
			callback(err, result.insertId);
		});
	}

	listDCaseTag(dcaseId: number, callback: (err:any, list:Tag[])=>void) {
		async.waterfall([
			(next) => {
				this.con.query('SELECT t.* FROM tag t, dcase_tag_rel r WHERE t.id = r.tag_id AND r.dcase_id=?', [dcaseId], (err:any, result:any) => {
						next(err, result);
				});
			},
			(result:any, next) => {
				var list:Tag[] = _.map(result, (row:any) => {
						return Tag.tableToObject(row);
					});
				next(null, list);
			}
		], (err:any, list: Tag[]) => {
			callback(err, list);
		});
	}

	insertDCaseTagList(dcaseId:number, tagList: string[], callback: (err:any)=>void) {
		if (!tagList || tagList.length == 0) {
			callback(null);
			return;
		}
		async.waterfall([
			(next) => {
				this.insertDCaseTag(dcaseId, tagList[0], (err:any) => next(err));
			}],
			(err:any) => {
				if (err) {
					callback(err);
					return;
				}
				this.insertDCaseTagList(dcaseId, tagList.slice(1), callback);
			}
		);
	}
	insertDCaseTag(dcaseId: number, tag: string, callback: (err:any)=>void) {
		tag = tag.trim();
		if (tag.length == 0) {callback(null); return;}
		async.waterfall([
			(next) => {
				this.con.query('SELECT id FROM tag WHERE label=?', [tag], (err:any, result:any) => next(err, result));
			},
			(result:any, next) => {
				if (result.length > 0) {
					next(null, result[0].id);
					return;
				}
				this.insert(tag, (err:any, tagId:number) => next(err, tagId));
			},
			(tagId:number, next) => {
				this.con.query('INSERT INTO dcase_tag_rel(dcase_id, tag_id) VALUES(?, ?)', [dcaseId, tagId], (err:any, result:any) => {
						next(err);
				});
			}], 
			(err:any) => {
				callback(err);
			}
		);
	}
	removeDCaseTagList(dcaseId:number, tagList: Tag[], callback: (err:any)=>void) {
		if (!tagList || tagList.length == 0) {
			callback(null);
			return;
		}
		async.waterfall([
			(next) => {
				var tagIdList = _.map(tagList, (tag:Tag) => {return tag.id;});
				var tagVars = _.map(tagIdList, (id:number) => {return '?';}).join(',');
				var params = [].concat([dcaseId]).concat(tagIdList);
				this.con.query('DELETE FROM dcase_tag_rel WHERE dcase_id=? AND tag_id in (' + tagVars + ')', params, (err:any, result:any) => next(err));
			}],
			(err:any) => {
				callback(err);
			}
		);
	}
}
