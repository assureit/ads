import model = module('./model')
import error = module('../api/error')
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
}
