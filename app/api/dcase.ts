///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_dcase = module('../model/dcase')
import model_commit = module('../model/commit')
import model_node = module('../model/node')
import model_pager = module('../model/pager')
import model_issue = module('../model/issue')
import model_user = module('../model/user')
import model_tag = module('../model/tag')
import error = module('./error')
var async = require('async')
var _ = require('underscore');

export function searchDCase(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var dcaseDAO = new model_dcase.DCaseDAO(con);
	params = params || {};
	var tagList = _.filter(params.tagList, (it:string) => {return typeof(it) == 'string';});
	dcaseDAO.list(params.page, tagList, (err:any, pager: model_pager.Pager, result: model_dcase.DCase[]) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		con.close();
		var list = [];
		result.forEach((val) => {
			list.push({
				dcaseId: val.id, 
				dcaseName: val.name,
				userName: val.user.loginName,
				latestCommit: {
					dateTime: val.latestCommit.dateTime,
					commitId: val.latestCommit.id,
					userName: val.latestCommit.user.loginName,
					userId: val.latestCommit.userId,
					commitMessage: val.latestCommit.message
				}
			});
		});
		callback.onSuccess({
			summary: {
				currentPage: pager.getCurrentPage(),
				maxPage: pager.getMaxPage(),
				totalItems:pager.totalItems,
				itemsPerPage: pager.limit
			},
			dcaseList:list
		});
	});
}

export function getDCase(params:any, userId: number, callback: type.Callback) {
	
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.dcaseId) checks.push('DCase ID is required.');
		if (params && params.dcaseId && !isFinite(params.dcaseId) ) checks.push('DCase ID must be a number.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var con = new db.Database();

	con.query({sql: 'SELECT * FROM dcase d, commit c WHERE d.id = c.dcase_id AND c.latest_flag=TRUE and d.id = ?', nestTables: true}, [params.dcaseId], (err, result) => {
		if (err) {
			con.close();
			throw err;
		}
		if (result.length == 0) {
			con.close();
			callback.onFailure(new error.NotFoundError('Effective DCase does not exist.'));
			return;
		}
	
		con.close();
		var c = result[0].c;
		var d = result[0].d;
		callback.onSuccess({
			commitId: c.id,
			dcaseName: d.name,
			contents: c.data
		});
	});
}

export function getNodeTree(params:any, userId: number, callback: type.Callback) {
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.commitId) checks.push('Commit ID is required.');
		if (params && params.commitId && !isFinite(params.commitId) ) checks.push('Commit ID must be a number.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;
	var con = new db.Database();
	con.query({sql: 'SELECT * FROM commit WHERE id = ?', nestTables: true}, [params.commitId], (err, result) => {
		if (err) {
			con.close();
			throw err;
		}

		if (result.length == 0) {
			callback.onFailure(new error.NotFoundError('Effective Commit does not exist.'));
			return;
		}

		con.close();
		var c = result[0].commit;
		callback.onSuccess({
			contents: c.data
		});
	});
}

export function searchNode(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	con.begin((err, result) => {
		var nodeDAO = new model_node.NodeDAO(con);
		nodeDAO.search(params.page, params.text, (err:any, pager: model_pager.Pager, list: model_node.Node[]) => {
			if (err) {
				callback.onFailure(err);
				return;
			}
			var searchResultList = [];
			list.forEach((node) => {
				searchResultList.push({
					dcaseId: node.dcase.id, 
					nodeId: node.thisNodeId, 
					dcaseName:node.dcase.name, 
					description: node.description, 
					nodeType: node.nodeType
				});
			});
			callback.onSuccess({
				summary: {
					currentPage: pager.getCurrentPage(),
					maxPage: pager.getMaxPage(),
					totalItems:pager.totalItems,
					itemsPerPage: pager.limit
				},
				searchResultList: searchResultList
			});
			con.close();
		});
	});
}

export function createDCase(params:any, userId: number, callback: type.Callback) {
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.dcaseName) checks.push('DCase name is required.');
		if (params && params.dcaseName && params.dcaseName.length > 255) checks.push('DCase name should not exceed 255 characters.');
		if (params && !params.contents) checks.push('Contents is required.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}
	if (!validate(params)) return;

	var con = new db.Database();
	con.begin((err, result) => {
		var userDAO = new model_user.UserDAO(con);
		userDAO.select(userId, (err:any, user: model_user.User) => {
			if (err) {
				callback.onFailure(err);
				return;
			}
			var dcaseDAO = new model_dcase.DCaseDAO(con);
			dcaseDAO.insert({userId: userId, dcaseName: params.dcaseName}, (err:any, dcaseId:number) => {
				if (err) {
					callback.onFailure(err);
					return;
				}
				var commitDAO = new model_commit.CommitDAO(con);
				commitDAO.insert({data: JSON.stringify(params.contents), dcaseId: dcaseId, userId: userId, message: 'Initial Commit'}, (err:any, commitId:number) => {
					if (err) {
						callback.onFailure(err);
						return;
					}
					var nodeDAO = new model_node.NodeDAO(con);
					nodeDAO.insertList(dcaseId, commitId, params.contents.NodeList, (err:any) => {
						if (err) {
							callback.onFailure(err);
							return;
						}
						con.commit((err, result) =>{
							callback.onSuccess({dcaseId: dcaseId, commitId: commitId});
							con.close();
						});
					});
				});
			});
		});
	});
}

export function commit(params: any, userId: number, callback: type.Callback) {
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.commitId) checks.push('Commit ID is required.');
		if (params && params.commitId && !isFinite(params.commitId) ) checks.push('Commit ID must be a number.');
		if (params && !params.commitMessage) checks.push('Commit Message is required.');
		if (params && !params.contents) checks.push('Contents is required.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var con = new db.Database();
	var commitDAO = new model_commit.CommitDAO(con);
	con.begin((err, result) => {
		var userDAO = new model_user.UserDAO(con);
		userDAO.select(userId, (err:any, user: model_user.User) => {
			if (err) {
				callback.onFailure(err);
				return;
			}

			commitDAO.get(params.commitId, (err, resultCheck) => {
				if (err) {
					callback.onFailure(err);
					return;
				}
				if (resultCheck.latestFlag == false) {
					callback.onFailure(new error.VersionConflictError('CommitID is not the effective newest commitment.'));
					return;
				}

				// _commit(con, params.commitId, params.commitMessage, params.contents, (err, result) => {
				commitDAO.commit(userId, params.commitId, params.commitMessage, params.contents, (err, result) => {
					con.commit((err, _result) =>{
						if (err) {
							callback.onFailure(err);
							return;
						}
						callback.onSuccess(result);
						con.close();
					});
				});
			});
		});
	});
};

export function deleteDCase(params:any, userId: number, callback: type.Callback) {
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.dcaseId) checks.push('DCase ID is required.');
		if (params && params.dcaseId && !isFinite(params.dcaseId) ) checks.push('DCase ID must be a number.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var con = new db.Database();
	con.begin((err, result) => {
		var userDAO = new model_user.UserDAO(con);
		userDAO.select(userId, (err:any, user: model_user.User) => {
			if (err) {
				callback.onFailure(err);
				return;
			}
			var dcaseDAO = new model_dcase.DCaseDAO(con);

			dcaseDAO.get(params.dcaseId, (err:any, result:model_dcase.DCase) => {
				if (err) {
					callback.onFailure(err);
					return;
				}
				if (result.deleteFlag) {
					callback.onFailure(new error.NotFoundError('Effective DCase does not exist.'));
					return;
				}

				dcaseDAO.remove(params.dcaseId, (err:any) => {
					if (err) {
						callback.onFailure(err);
						return;
					}
					con.commit((err, result) =>{
						callback.onSuccess({dcaseId: params.dcaseId});
						con.close();
					});
				});
			});
		});
	});
}

export function editDCase(params:any, userId: number, callback: type.Callback) {
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.dcaseId) checks.push('DCase ID is required.');
		if (params && params.dcaseId && !isFinite(params.dcaseId) ) checks.push('DCase ID must be a number.');
		if (params && !params.dcaseName) checks.push('DCase Name is required.');
		if (params && params.dcaseName && params.dcaseName.length > 255) checks.push('DCase name should not exceed 255 characters.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var con = new db.Database();
	con.begin((err, result) => {
		var userDAO = new model_user.UserDAO(con);
		userDAO.select(userId, (err:any, user: model_user.User) => {
			if (err) {
				callback.onFailure(err);
				return;
			}
			var dcaseDAO = new model_dcase.DCaseDAO(con);
			
			dcaseDAO.get(params.dcaseId, (err:any, result:model_dcase.DCase) => {
				if (err) {
					callback.onFailure(err);
					return;
				}
				if (result.deleteFlag) {
					callback.onFailure(new error.NotFoundError('Effective DCase does not exist.'));
					return;
				}

				dcaseDAO.update(params.dcaseId, params.dcaseName, (err:any) => {
					if (err) {
						callback.onFailure(err);
						return;
					}
					con.commit((err, result) =>{
						if (err) {
							callback.onFailure(err);
							return;
						}
						callback.onSuccess({dcaseId: params.dcaseId});
						con.close();
					});
				});
			});
		});
	});
}

export function getCommitList(params:any, userId: number, callback: type.Callback) {
	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.dcaseId) checks.push('DCase ID is required.');
		if (params && params.dcaseId && !isFinite(params.dcaseId) ) checks.push('DCase ID must be a number.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var con = new db.Database();
	var commitDAO = new model_commit.CommitDAO(con);
	commitDAO.list(params.dcaseId, (err:any, list: model_commit.Commit[]) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		con.close();

		if (list.length == 0) {
			callback.onFailure(new error.NotFoundError('Effective DCase does not exist.'));
			return;
		}

		var commitList = [];
		list.forEach((c: model_commit.Commit) => {
			commitList.push({commitId: c.id, dateTime: c.dateTime, commitMessage: c.message, userId: c.userId, userName: c.user.loginName});
		});
		callback.onSuccess({
			commitList: commitList
		});
	});
}

export function getTagList(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var tagDAO = new model_tag.TagDAO(con);
	async.waterfall([
		(next) => {
			tagDAO.list((err:any, list: model_tag.Tag[]) => {
				next(err, list);
			});
		}
	], (err:any, list:model_tag.Tag[]) => {
		con.close();
		if (err) {
			callback.onFailure(err);
			return;
		}
		var tagList = _.map(list, (tag:model_tag.Tag) => {return tag.label});
		callback.onSuccess({tagList: tagList});
	});
}
