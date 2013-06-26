import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_dcase = module('../model/dcase')
import model_commit = module('../model/commit')
import model_node = module('../model/node')
import model_pager = module('../model/pager')
import model_issue = module('../model/issue')
import error = module('./error')

export function searchDCase(params:any, callback: type.Callback) {
	var con = new db.Database();
	var dcaseDAO = new model_dcase.DCaseDAO(con);
	params = params || {};
	dcaseDAO.list(params.page, (err:any, pager: model_pager.Pager, result: model_dcase.DCase[]) => {
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

export function getDCase(params:any, callback: type.Callback) {
	var con = new db.Database();
	con.query({sql: 'SELECT * FROM dcase d, commit c WHERE d.id = c.dcase_id AND c.latest_flag=TRUE and d.id = ?', nestTables: true}, [params.dcaseId], (err, result) => {
		if (err) {
			con.close();
			throw err;
		}

		// TODO: NotFound処理
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

export function getNodeTree(params:any, callback: type.Callback) {
	var con = new db.Database();
	con.query({sql: 'SELECT * FROM commit WHERE id = ?', nestTables: true}, [params.commitId], (err, result) => {
		if (err) {
			con.close();
			throw err;
		}

		// TODO: NotFound処理
		con.close();
		var c = result[0].commit;
		callback.onSuccess({
			contents: c.data
		});
	});
}

export function searchNode(params:any, callback: type.Callback) {
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

export function createDCase(params:any, callback: type.Callback) {
	// TODO: 認証チェック
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更

	var con = new db.Database();
	con.begin((err, result) => {
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
}

export function commit(params: any, callback: type.Callback) {
	// TODO: 認証チェック
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更

	var con = new db.Database();
	con.begin((err, result) => {
		_commit(con, params.commitId, params.commitMessage, params.contents, (err, result) => {
			con.commit((err, result) =>{
				if (err) {
					callback.onFailure(err);
					return;
				}
				callback.onSuccess(result);
				con.close();
			});
		});
		// var commitDAO = new model_commit.CommitDAO(con);
		// commitDAO.get(params.commitId, (err:any, com: model_commit.Commit) => {
		// 	if (err) {
		// 		callback.onFailure(err);
		// 		return;
		// 	}
		// 	commitDAO.insert({data: JSON.stringify(params.contents), prevId: params.commitId, dcaseId: com.dcaseId, userId: userId, message: params.commitMessage}, (err:any, commitId) => {
		// 		if (err) {
		// 			callback.onFailure(err);
		// 			return;
		// 		}
		// 		var nodeDAO = new model_node.NodeDAO(con);
		// 		nodeDAO.insertList(com.dcaseId, commitId, params.contents.NodeList, (err:any) => {
		// 			if (err) {
		// 				callback.onFailure(err);
		// 				return;
		// 			}
		// 			commitDAO.update(commitId, JSON.stringify(params.contents), (err:any) => {
		// 				con.commit((err, result) =>{
		// 					if (err) {
		// 						callback.onFailure(err);
		// 						return;
		// 					}
		// 					// callback.onSuccess({commitId: commitId});

		// 					var issueDAO = new model_issue.IssueDAO(con);
		// 					issueDAO.publish(com.dcaseId, (err:any) => {
		// 						// TODO: 管理者にエラー通知などのエラー処理
		// 						con.commit((err, result) =>{
		// 							if (err) {
		// 								// TODO: 管理者にエラー通知などのエラー処理
		// 								return;
		// 							}
		// 					callback.onSuccess({commitId: commitId});
		// 							con.close();
		// 						});
		// 					});
		// 				});
		// 			});
		// 		});
		// 	});
		// });

	});
};

export function _commit(con: db.Database, previousCommitId:number, message: string, contents:any, callback: (err:any, result:any)=>void) {
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更
	var commitDAO = new model_commit.CommitDAO(con);
	commitDAO.get(previousCommitId, (err:any, com: model_commit.Commit) => {
		if (err) {
			callback(err, null);
			return;
		}
		commitDAO.insert({data: JSON.stringify(contents), prevId: previousCommitId, dcaseId: com.dcaseId, userId: userId, message: message}, (err:any, commitId) => {
			if (err) {
				callback(err, null);
				return;
			}
			var nodeDAO = new model_node.NodeDAO(con);
			nodeDAO.insertList(com.dcaseId, commitId, contents.NodeList, (err:any) => {
				if (err) {
					callback(err, null);
					return;
				}
				commitDAO.update(commitId, JSON.stringify(contents), (err:any) => {
					var issueDAO = new model_issue.IssueDAO(con);
					issueDAO.publish(com.dcaseId, (err:any) => {
						if (err) {
							callback(err, null);
							return;
						}
						callback(null, {commitId: commitId});
					});
				});
			});
		});
	});
}

export function deleteDCase(params:any, callback: type.Callback) {
	// TODO: 認証チェック
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更

	var con = new db.Database();
	con.begin((err, result) => {
		var dcaseDAO = new model_dcase.DCaseDAO(con);
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
}

export function editDCase(params:any, callback: type.Callback) {
	// TODO: 認証チェック
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更

	var con = new db.Database();
	con.begin((err, result) => {
		var dcaseDAO = new model_dcase.DCaseDAO(con);
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
}

export function getCommitList(params:any, callback: type.Callback) {
	var con = new db.Database();
	var commitDAO = new model_commit.CommitDAO(con);
	commitDAO.list(params.dcaseId, (err:any, list: model_commit.Commit[]) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		con.close();
		var commitList = [];
		list.forEach((c: model_commit.Commit) => {
			commitList.push({commitId: c.id, dateTime: c.dateTime, commitMessage: c.message, userId: c.userId, userName: c.user.loginName});
		});
		callback.onSuccess({
			commitList: commitList
		});
	});
}
