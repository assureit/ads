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
		return new Project(table.id, table.name, table.public_flag);
	}
}

export class ProjectDAO extends model.DAO {

	get(userId: number, projectId: number, callback: (err:any, result: Project)=>void): void {
		async.waterfall([
			(next) => {
				this.con.query({sql:'SELECT * FROM project AS p INNER JOIN project_has_user AS pu ON p.id=pu.project_id WHERE p.delete_flag=0 AND p.id=? AND (p.public_flag=1 OR pu.user_id=?)',
					nestTables:true}, [projectId, userId], (err:any, result:any) => next(err, result));
			},
			(result:any, next) => {
				var list:Project[] = [];
				result.forEach((row) => {
					list.push(Project.tableToObject(row.p));
				});
				if (list.length == 0) {
					next(new error.ForbiddenError('You need permission to access the project', {userId:userId, projectId:projectId}));
					return;
				}
				next(null, list[0]);
			}
		], (err:any, list: Project) => {
			callback(err, list);
		});
	}

	list(userId: number, callback: (err:any, result: Project[])=>void): void {
		async.waterfall([
			(next) => {
				this.con.query({sql:'SELECT * FROM project AS p INNER JOIN project_has_user AS pu ON p.id=pu.project_id WHERE p.delete_flag=0 AND p.public_flag=0 AND pu.user_id=?',
					nestTables:true}, [userId], (err:any, result:any) => {
						next(err, result);
				});
			},
			(result:any, next) => {
				var list:Project[] = [];
				result.forEach((row) => {
					list.push(Project.tableToObject(row.p));
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
				this.con.query('SELECT * FROM project AS p WHERE p.delete_flag=0 AND p.public_flag=1', (err:any, result:any) => {
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
				this.con.query('SELECT count(id) as cnt FROM project_has_user WHERE project_id = ? AND user_id = ?',
					[projectId, userId], (err:any, result:any) => next(err, result));
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

	getProjectUserAndRole(projectId: number, callback: (err:any, result:any) => void): void {
		async.waterfall([
			(next) => {
				this.con.query('SELECT u.login_name, pu.role FROM user AS u INNER JOIN project_has_user AS pu ON u.id=pu.user_id WHERE pu.project_id=?', [projectId], (err:any, result:any) => next(err, result));
			},
			(result:any, next) => {
				var list = [];
				result.forEach((row) => {
					list.push([row.login_name, row.role]);
				});
				next(null, list);
			}
		], (err:any, list:any) => {
			callback(err, list);
		});
	}

	//users: [[name, role], [name, role], ...]
	updateProjectUser(projectId: number, users:string[][], callback: (err:any) => void): void {
		var roles = {};
		for(var i = 0; i < users.length; i++){
			roles[users[i][0]] = users[i][1];
		}
		var userList = [];
		var vars:string;
		async.waterfall([
			(next) => {
				var names: string[] = _.map(users, (it:string) => {return it[0]});
				var vars:string = _.map(users, (it:string) => {return '?'}).join(',');
				this.con.query('SELECT * FROM user WHERE login_name in (' + vars + ')', names, (err:any, result:any) => next(err, result));
			},
			(result:any[], next) => {
				var userIdList = [];
				result.forEach((row:any) => {
					userIdList.push(row.id);
					userList.push({ id: row.id, name: row.login_name, role:(roles[row.login_name] || null) })
				});
				vars = _.map(userIdList, (it:string) => {return '?'}).join(',');
				if (userIdList.length == 0) {
					next(new error.NotFoundError('Project member is not found.', users));
					return;
				}
				next(null, userIdList);
			},
			(userIdList:number[], next) => {
				this.con.query('DELETE FROM project_has_user WHERE project_id = ? AND user_id NOT IN (' + vars + ')',
					[projectId].concat(userIdList), (err:any, result:any) => next(err, userIdList));
			},
			(userIdList:number[], next) => {
				this.con.query('INSERT INTO project_has_user(project_id, user_id) SELECT ?, u.id FROM user u ' +
					'WHERE u.id IN (' + vars + ') AND NOT EXISTS (SELECT id FROM project_has_user pu WHERE pu.user_id = u.id AND pu.project_id = ?)',
					[projectId].concat(userIdList).concat(projectId), (err:any, result:any) => next(err));
			},
			(next) => {
				async.waterfall(_.map(userList, (user) => {
					return (nxt) => this.con.query('UPDATE project_has_user SET role=? WHERE user_id=? AND project_id=?',
						[user.role, user.id, projectId], (err:any, result:any) => nxt(err));
				}), (err:any) => next(err));
			},
		], (err:any) => {
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

	edit(projectId: number, name: string, public_flag: boolean, callback: (err:any)=>void): void {
		async.waterfall([
			(next) => {
				this.con.query('UPDATE project SET name=?, public_flag=? WHERE id=?',
					[name, public_flag, projectId],
					(err:any, result:any) => {
						next(err, result);
				});
			},
		], (err:any, result:any) => {
			callback(err);
		});
	}

	//deprecated
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
