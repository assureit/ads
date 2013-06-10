import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')

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
	con.query('INSERT INTO dcase(user_id, name) VALUES (?, ?)', [userId, params.dcaseName], (err, result) => {
		if (err) {
			con.rollback();
			con.close();
			throw err;
		}
		con.close();

		var dcaseId = result.insertId;
		callback.onSuccess({'dcaseId': dcaseId});
	});
}