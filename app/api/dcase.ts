import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import dcase = module('../model/dcase')
import commit = module('../model/commit')

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
		dc.insert({userId: userId, dcaseName: params.dcaseName}, (dcaseId) => {
			var cm = new commit.Commit(con);
			cm.insert({data: JSON.stringify(params.contents), dcaseId: dcaseId, userId: userId, message: 'Initial Commit'}, (commitId) => {
				con.commit((err, result) =>{
					callback.onSuccess({dcaseId: dcaseId, commitId: commitId});
					con.close();
				});
			});
		});
	});
}