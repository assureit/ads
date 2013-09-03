import model = module('./model')
import error = module('../api/error')
import constant = module('../constant')
import model_node = module('./node')
import model_dcase = module('./dcase')
var async = require('async');
var _ = require('underscore');

export class Project {
	constructor(public id:number, public name:string, public isPublic:number) {
	}
	static tableToObject(table: any): Project {
		return new Project(table.id, table.name, table.isPublic);
	}
}

export class ProjectDAO extends model.DAO {
	list(userId: number, callback: (err:any, result: Project[])=>void): void {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM project AS p INNER JOIN project_has_user AS pu ON p.id=pu.project_id WHERE pu.user_id=?', [userId],
					(err:any, result:any) => {
						next(err, result);
				});
			},
			(result:any, next) => {
				var list:Project[] = [];
				result.forEach((row) => {
					list.push(Project.tableToObject(row));
				});
				next(null, list);
			}
		], (err:any, list: Project[]) => {
			callback(err, list);
		});
	}

	publiclist(userId: number, callback: (err:any, result: Project[])=>void): void {
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM project AS p WHERE p.public_flag=1',
					(err:any, result:any) => {
						next(err, result);
				});
			},
			(result:any, next) => {
				var list:Project[] = [];
				result.forEach((row) => {
					list.push(Project.tableToObject(row));
				});
				next(null, list);
			}
		], (err:any, list: Project[]) => {
			callback(err, list);
		});
	}

	insert(name: string, public_flag: boolean, callback: (err:any, projectId:number)=>void): void {
		async.waterfall([
			(next) => {
				//TODO insert first member
				this.con.query('INSERT INTO project(name, public_flag) VALUES(?, ?)', [name, public_flag], (err:any, result:any) => {
					next(err, result);
				});
			},
		], (err:any, result:any) => {
			callback(err, result.insertId);
		});
	}

	remove(userId:number, projectId:number, callback: (err:any) => void): void {
		async.waterfall([
			(next) => {
				this.con.query('SELECT count(id) as cnt FROM project_has_user WHERE project_id = ? AND user_id = ?', [projectId, userId], (err:any, result:any) => next(err, result));
			},
			(result, next) => {
				if (result[0].cnt == 0) {
					next(new error.ForbiddenError('You need permission to remove the project', {userId:userId, projectId:projectId}));
				} else {
					next();
				}
			},
			(next) => {
				this.con.query('UPDATE project SET delete_flag=TRUE WHERE id=?', [projectId], (err:any, result:any) => next(err, result));
			},
		], (err:any, result:any) => {
			callback(err);
		});
	}

	addMember(projectId: number, userId: number, callback: (err:any) => void): void {
		async.waterfall([
			(next) => {
				this.con.query('INSERT INTO project_has_user(project_id, user_id) VALUES(?, ?)',
					[projectId, userId],
					(err:any, result:any) => {
						next(err, result);
				});
			},
		], (err:any, result:any) => {
			callback(err);
		});
	}

	edit(projectId: number, name: string, callback: (err:any)=>void): void {
		async.waterfall([
			(next) => {
				this.con.query('UPDATE project SET name=? WHERE id=?',
					[name, projectId],
					(err:any, result:any) => {
						next(err, result);
				});
			},
		], (err:any, result:any) => {
			callback(err);
		});
	}

	updateMember(dcaseId:number, callback: (err:any) => void): void {
		var dcaseDAO = new model_dcase.DCaseDAO(this.con);
		var dcase:model_dcase.DCase;
		async.waterfall([
			(next) => {
				dcaseDAO.getDetail(dcaseId, (err:any, dc:model_dcase.DCase) => next(err, dc));
			},
			(dc: model_dcase.DCase, next) => {
				dcase = dc;
				if (dcase.type != constant.CASE_TYPE_STAKEHOLDER) {
					callback(null);
					return;
				}
				var data:any = JSON.parse(dcase.latestCommit.data);
				var evidences = _.filter(data.contents.NodeList, (it:any) => {return it.NodeType == 'Evidence';});
				var users = _.uniq(_.flatten(_.map(evidences, (it:any) => {return it.Description.split('\n');})));

				var vars:string = _.map(users, (it:string) => {return '?'}).join(',');
				this.con.query('SELECT * FROM user WHERE login_name in (' + vars + ')', users, (err:any, result:any) => next(err, users, result));
			},
			(users:any[], result:any[], next) => {
				var userIdList = [];
				result.forEach((row:any) => {
					userIdList.push(row.id);
				});
				if (userIdList.length == 0) {
					next(new error.NotFoundError('Project member is not found.', users));
					return;
				}
				next(null, userIdList);
			},
			(userIdList:number[], next) => {
				var vars:string = _.map(userIdList, (it:string) => {return '?'}).join(',');
				this.con.query('DELETE FROM PROJECT_HAS_USER WHERE project_id = ? AND user_id NOT IN (' + vars + ')', [dcase.projectId].concat(userIdList), (err:any, result:any) => next(err, userIdList));
			},
			(userIdList:number[], next) => {
				var vars:string = _.map(userIdList, (it:string) => {return '?'}).join(',');
				this.con.query('INSERT INTO project_has_user(project_id, user_id) SELECT ?, u.id FROM user u WHERE u.id IN (' + vars + ') AND NOT EXISTS (SELECT id FROM project_has_user pu WHERE pu.user_id = u.id AND pu.project_id = ?)', [dcase.projectId].concat(userIdList).concat(dcase.projectId), (err:any, result:any) => next(err));
			},
		], (err:any) => {
			callback(err);
		});
	}
}
