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

export function createProject(params:any, userId: number, callback: type.Callback) {
	//TODO validation
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	projectDAO.insert(params.name, params.isPublic, (err:any, projectId: number) => {
		con.close();
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess({projectId: projectId});
	});
}

export function editProject(params:any, userId: number, callback: type.Callback) {
	//TODO validation
	var con = new db.Database();
	var projectDAO = new model_project.ProjectDAO(con);
	projectDAO.edit(params.projectId, params.name, (err:any) => {
		con.close();
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess({ok: true}); //FIXME
	});
}

