///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_dcase = module('../model/dcase')
import model_commit = module('../model/commit')
import model_project = module('../model/project')
import model_node = module('../model/node')
import model_pager = module('../model/pager')
import model_issue = module('../model/issue')
import model_user = module('../model/user')
import model_tag = module('../model/tag')
import error = module('./error')
var async = require('async')
var _ = require('underscore');
var CONFIG = require('config');

export function getProjectList(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	params = params || {};
	async.waterfall([
		(next) => {
			projectDAO.list(userId, (err:any, result: model_project.Project[]) => {
				next(err, result);
			});
		}],
		(err:any, result:model_project.Project[]) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			var resultProjectlist = _.map(result, (val: model_project.Project) => {
				return {
					projectId: val.id, 
					projectName: val.name
				};
			});
			callback.onSuccess({
				projectList:resultProjectlist
			});
		}
	);
}

export function getPublicProjectList(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	params = params || {};
	async.waterfall([
		(next) => {
			projectDAO.publiclist(userId, (err:any, result: model_project.Project[]) => {
				next(err, result);
			});
		}],
		(err:any, result:model_project.Project[]) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			var resultProjectlist = _.map(result, (val: model_project.Project) => {
				return {
					projectId: val.id, 
					projectName: val.name
				};
			});
			callback.onSuccess({
				projectList:resultProjectlist
			});
		}
	);
}

export function getProjectUser(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	var userDAO = new model_user.UserDAO(con);
	params = params || {};
	params.projectId = params.projectId ? params.projectId : 1;
	async.waterfall([
		(next) => {
			userDAO.projectUserList(params.projectId, (err:any, result: model_user.User[]) => {
				next(err, result);
			});
		}],
		(err:any, result:model_user.User[]) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			var resultUserlist = _.map(result, (val: model_user.User) => {
				return {
					userId: val.id, 
					loginName: val.loginName
				};
			});
			callback.onSuccess({
				userList:resultUserlist
			});
		}
	);
}

export function getProjectUserAndRole(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	params = params || {};
	async.waterfall([
		(next) => {
			projectDAO.getProjectUserAndRole(params.projectId, (err:any, result: string[][]) => {
				next(err, result);
			});
		}],
		(err:any, result:string[][]) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			callback.onSuccess({
				userList:result
			});
		}
	);
}

export function createProject(params:any, userId: number, callback: type.Callback) {
	//TODO validation
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	var projectDAO = new model_project.ProjectDAO(con);
	// var dcaseDAO = new model_dcase.DCaseDAO(con);
	// var commitDAO = new model_commit.CommitDAO(con);
	// var nodeDAO = new model_node.NodeDAO(con);
    // var dcaseStr:string = JSON.stringify(CONFIG.ads.stakeholderCase);
    // var dcase = null;
	async.waterfall([
		(next) => {
			con.begin((err, result) => next(err));
		},
		(next) => {
			userDAO.select(userId, (err:any, user: model_user.User) => next(err, user));
		},
		(user:model_user.User, next) => {
			// dcase = JSON.parse(dcaseStr.replace('%USER%', user.loginName));
			projectDAO.insert(params.name, params.isPublic, (err:any, projectId: number) => next(err, user, projectId));
		},
		(user:model_user.User, projectId:number, next) => {
			projectDAO.addMember(projectId, userId, (err:any) => next(err, user, projectId));
		},
		// (user:model_user.User, projectId:number, next) => {
		// 	dcaseDAO.insert({userId: userId, dcaseName: dcase.DCaseName, projectId: projectId, type:constant.CASE_TYPE_STAKEHOLDER}, (err:any, dcaseId:number) => next(err, user, projectId, dcaseId));
		// },
		// (user:model_user.User, projectId:number, dcaseId:number, next) => {
		// 	commitDAO.insert({data: JSON.stringify(dcase.contents), dcaseId: dcaseId, userId: userId, message: 'Initial Commit'}, (err:any, commitId:number) => next(err, user, projectId, dcaseId, commitId));
		// },
		// (user:model_user.User, projectId:number, dcaseId:number, commitId:number, next) => {
		// 	nodeDAO.insertList(dcaseId, commitId, dcase.contents.NodeList, (err:any) => next(err, user, projectId, dcaseId, commitId));
		// },
		// (user:model_user.User, projectId:number, dcaseId:number, commitId:number, next) => {
		(user:model_user.User, projectId:number, next) => {
			con.commit((err, result) => next(err, user, projectId));
		},
		]
		,(err:any, user:model_user.User, projectId:number) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			callback.onSuccess({projectId: projectId});
		}
	);
}

export function updateProjectUser(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	projectDAO.updateProjectUser(params.projectId, params.users, (err:any) => {
		con.close();
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess({ok: true}); //FIXME
	});
}

export function editProject(params:any, userId: number, callback: type.Callback) {
	//TODO validation
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	projectDAO.edit(params.projectId, params.name, params.isPublic, (err:any) => {
		con.close();
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess({ok: true}); //FIXME
	});
}

export function deleteProject(params:any, userId: number, callback: type.Callback) {
	//TODO validation
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	projectDAO.remove(userId, params.projectId, (err:any) => {
		con.close();
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess({ok: true}); //FIXME
	});
}

