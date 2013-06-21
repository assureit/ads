import db = module('../db/db')
import constant = module('../constant')
import model_file = module('../model/file')
import fs = module('fs')

export var upload = function(req: any, res: any){

	function onError(err: any, upfile: any) :void {
		if (fs.existsSync(upfile.path)) {
			fs.unlinkSync(upfile.path);
		}
		res.send(err);
	}

	function getDestinationDirectory() : string {
		var d = new Date();
		var yy: string = String(d.getFullYear());
		var mm: string = String(d.getMonth() + 1);
		var dd: string = String(d.getDate());
		if (mm.length == 1) mm = '0' + mm;
		if (dd.length == 1) dd = '0' + dd;
		
		return 'upload/' + yy + mm + dd;	// TODO: 'upload'をconstantへ入れるか？
	}

	var userId = constant.SYSTEM_USER_ID;	// TODO:ログインユーザーIDに変更

	var upfile = req.files.upfile
	if (upfile) {

		var con = new db.Database();
		con.begin((err, result) => {
			var fileDAO = new model_file.FileDAO(con);
			fileDAO.insert(upfile.name, userId, (err: any, fileId: number) => {
				if (err) {
					onError(err, upfile);
					return;
				}

				var despath = getDestinationDirectory();
	
				fileDAO.update(fileId, despath + '/' + fileId, (err: any) => {
					if (err) {
						onError(err, upfile);
						return;
					}
					con.commit((err, result) => {
						if (err) {
							onError(err, upfile);
							return;
						}
						if (!fs.existsSync(despath)) {
							fs.mkdirSync(despath);
						}
						fs.renameSync(upfile.path, despath + '/' + fileId);
						var body: any = {URL: 'http://tekitou.com/file/' + fileId};
						con.close();
						res.send(body, 200);
					});
				});
			});
		});
	} else {

	}
}

export var download = function(req: any, res: any) {
	console.log('*** download ***');
	console.log(req.params.idi);
	res.send(200);
}


export var test = function(req: any, res: any) {
	res.end('request end');
	console.log('hoge');
}
