import db = module('../db/db')
import type = module('./type')

export function getDCaseList(params:any, callback: type.Callback) {
	var con = new db.Database();
	con.query('SELECT * FROM dcase', (err, result) => {
		if (err) throw err;
		con.close();

		var list = [];
		result.forEach((val) => {
			list.push({dcaseId: val.id, dcaseName: val.name});
		});
		callback.onSuccess(list);
	});
}
