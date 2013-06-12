import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_dcase = module('../model/dcase')
import model_commit = module('../model/commit')
import model_node = module('../model/node')
import model_pager = module('../model/pager')

export function searchDCase(params:any, callback: type.Callback) {
	var con = new db.Database();
	var dcaseDAO = new model_dcase.DCaseDAO(con);
	params = params || {};
	dcaseDAO.list(params.page, (pager: model_pager.Pager, result: model_dcase.DCase[]) => {
		con.close();
		var list = [];
		result.forEach((val) => {
			list.push({
				dcaseId: val.id, 
				dcaseName: val.name,
				userName: val.user.name,
				latestCommit: {
					dateTime: val.latestCommit.dateTime,
					commitId: val.latestCommit.id,
					userName: val.latestCommit.user.name,
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
		nodeDAO.search(params.page, params.text, (pager: model_pager.Pager, list: model_node.Node[]) => {
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
		dcaseDAO.insert({userId: userId, dcaseName: params.dcaseName}, (dcaseId:number) => {
			var commitDAO = new model_commit.CommitDAO(con);
			commitDAO.insert({data: JSON.stringify(params.contents), dcaseId: dcaseId, userId: userId, message: 'Initial Commit'}, (commitId) => {
				var nodeDAO = new model_node.NodeDAO(con);
				nodeDAO.insertList(commitId, params.contents.NodeList, () => {
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
		var commitDAO = new model_commit.CommitDAO(con);
		commitDAO.get(params.commitId, (com: model_commit.Commit) => {
			commitDAO.insert({data: JSON.stringify(params.contents), prevId: params.commitId, dcaseId: com.dcaseId, userId: userId, message: params.commitMessage}, (commitId) => {
				var nodeDAO = new model_node.NodeDAO(con);
				nodeDAO.insertList(commitId, params.contents.NodeList, () => {
					con.commit((err, result) =>{
						callback.onSuccess({commitId: commitId});
						con.close();
					});
				});
			});
		});

	});
};

export function deleteDCase(params:any, callback: type.Callback) {
	// TODO: 認証チェック
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更

	var con = new db.Database();
	con.begin((err, result) => {
		var dcaseDAO = new model_dcase.DCaseDAO(con);
		dcaseDAO.remove(params.dcaseId, () => {
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
		dcaseDAO.update(params.dcaseId, params.dcaseName, () => {
			con.commit((err, result) =>{
				callback.onSuccess({dcaseId: params.dcaseId});
				con.close();
			});
		});
	});
}

export function getCommitList(params:any, callback: type.Callback) {
	var con = new db.Database();
	var commitDAO = new model_commit.CommitDAO(con);
	commitDAO.list(params.dcaseId, (list: model_commit.Commit[]) => {
		con.close();
		var commitList = [];
		list.forEach((c: model_commit.Commit) => {
			commitList.push({commitId: c.id, dateTime: c.dateTime, commitMessage: c.message, userId: c.userId, userName: c.user.name});
		});
		callback.onSuccess({
			commitList: commitList
		});
	});
}
