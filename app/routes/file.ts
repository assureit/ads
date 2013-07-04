import db = module('../db/db')
import constant = module('../constant')
import model_file = module('../model/file')
import fs = module('fs')
import utilFs = module('../util/fs')

export var upload = function(req: any, res: any){

	function onError(err: any, upfile: any) :void {
		if(fs.existsSync(upfile.path)) {
			fs.unlink(upfile.path, (err) => {
				if (err) throw err;
				res.send(err);
			});
		} else {
			res.send(err);
		}
		
	}

	function getDestinationDirectory() : string {
		var d = new Date();
		var yy: string = String(d.getFullYear());
		var mm: string = String(d.getMonth() + 1);
		var dd: string = String(d.getDate());
		if (mm.length == 1) mm = '0' + mm;
		if (dd.length == 1) dd = '0' + dd;
		
		return 'upload/' + yy + '/' + mm + '/' + dd;	// TODO: 'upload'をconstantへ入れるか？
	}

	function getUserId() : number {
		var userId: number = constant.SYSTEM_USER_ID;

		var cookies = {};
		req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
			cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
		});

		if (cookies['userId']) {
			userId = Number(cookies['userId']);
		}
		return userId;
	}

	var userId = getUserId();

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
				utilFs.mkdirpSync(despath);
	
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

						// if (!fs.existsSync(despath)) {
						// 	fs.mkdirSync(despath);
						// }
						fs.renameSync(upfile.path, despath + '/' + fileId);
						// var url = req.protocol + '://' + req.host + '/file/';
						var body: any = 'URL=' + 'file/' + fileId;
						con.close();
						res.header('Content-Type', 'text/html');
						res.send(body);
					});
				});
			});
		});
	} else {
		res.send(401, "Bad Request");
	}
}

export var download = function(req: any, res: any) {

	var con = new db.Database();
	var fileDAO = new model_file.FileDAO(con);
	fileDAO.select(req.params.id, (err: any, path: string, name: string) => {
		if (err) {
			res.send(err);
			return;
		}
		fs.exists(path, (exists) => {
			if (exists) {
				res.download(path, name);
				// fs.readFile(path, (err, data) => {
				// 	var responseFile = data.toString('base64');
				// 	var body: any = {name: name, fileBody: responseFile};
				// 	res.send(body, 200);
				// 	return;
				// });
			} else {
				res.send(404, 'File Not Found');
			}
		});
	});
}

