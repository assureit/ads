import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import dcase = module('../model/dcase')
import model_commit = module('../model/commit')
import node = module('../model/node')

export function getDCaseList(params:any, callback: type.Callback) {
	var con = new db.Database();
	con.query('SELECT * FROM dcase', (err, result) => {
		if (err) {
			con.close();
			throw err;
		}
		con.close();

		var list = [];
		result.forEach((val) => {
			list.push({dcaseId: val.id, dcaseName: val.name});
		});
		callback.onSuccess(list);
	});
}

export function createDCase(params:any, callback: type.Callback) {
	// TODO: 認証チェック
	var userId = constant.SYSTEM_USER_ID;	// TODO: ログインユーザIDに要変更

	var con = new db.Database();
	con.begin((err, result) => {
		var dc = new dcase.DCase(con);
		dc.insert({userId: userId, dcaseName: params.dcaseName}, (dcaseId:number) => {
			var commitDAO = new model_commit.CommitDAO(con);
			commitDAO.insert({data: JSON.stringify(params.contents), dcaseId: dcaseId, userId: userId, message: 'Initial Commit'}, (commitId) => {
				var nd = new node.Node(con);
				nd.insertList(commitId, params.contents.NodeList, () => {
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
			console.log(com);
			commitDAO.insert({data: JSON.stringify(params.contents), prevId: params.commitId, dcaseId: com.dcaseId, userId: userId, message: params.commitMessage}, (commitId) => {
				var nd = new node.Node(con);
				nd.insertList(commitId, params.contents.NodeList, () => {
					con.commit((err, result) =>{
						callback.onSuccess({commitId: commitId});
						con.close();
					});
				});
			});
		});

	});
};

