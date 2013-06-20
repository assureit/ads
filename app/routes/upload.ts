import db = module('../db/db')
import constant = module('../constant')
import model_file = module('../model/file')

export var upload = function(req: any, res: any){

	function onError(err: any) :void {
		console.log(err);
		res.send(err);
	}

	function onSuccess() :void {
		console.log('OK');
		res.send('OK');
	}

	var userId = constant.SYSTEM_USER_ID;	// TODO:ログインユーザーIDに変更
	var con = new db.Database();
	var fileDAO = new model_file.FileDAO(con);
	console.log('aaa');
	fileDAO.insert(req.files.upfile.name, userId, (err: any, fileId: number) => {
	console.log('bbb');
		if (err) {
			onError(err);
			return;
		}
		con.close();
		console.log('momo');
	});

//	console.log('****************');
//	console.log(req.files);
//	console.log('****************');
//	res.end();
}

export var test = function(req: any, res: any) {
	res.end('request end');
	console.log('hoge');
}
