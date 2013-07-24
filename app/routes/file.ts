import db = module('../db/db')
import constant = module('../constant')
import model_file = module('../model/file')
import fs = module('fs')
import utilFs = module('../util/fs')
import error = module('../api/error')
import util_auth = module('../util/auth')
var async = require('async');
var CONFIG = require('config');

export var upload = function(req: any, res: any){
	var auth = new util_auth.Auth(req, res);

	function onError(err: any, errorCode: number, upfile: any) :void {
		if(fs.existsSync(upfile.path)) {
			fs.unlink(upfile.path, (err2) => {
				if (err2) {
					res.send(err2, error.HTTP_STATUS.INTERNAL_SERVER_ERROR);
					return;
				} else {
					res.send(err, errorCode); 
				}
			});
		} else {
			res.send(err, errorCode);
		}
		
	}

	function getDestinationDirectory() : string {
		var d = new Date();
		var yy: string = String(d.getFullYear());
		var mm: string = String(d.getMonth() + 1);
		var dd: string = String(d.getDate());
		if (mm.length == 1) mm = '0' + mm;
		if (dd.length == 1) dd = '0' + dd;
		
		return CONFIG.ads.uploadPath + '/' + yy + '/' + mm + '/' + dd;	// TODO: 'upload'をconstantへ入れるか？
	}

	function getUserId() : number {
		var userId = auth.getUserId();
		if (!userId) userId = constant.SYSTEM_USER_ID;
		return userId;
		// var userId: number = constant.SYSTEM_USER_ID;

		// var cookies = {};
		// req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
		// var parts = cookie.split('=');
		// 	cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
		// });

		// if (cookies['userId']) {
		// 	userId = Number(cookies['userId']);
		// }
		// return userId;
	}

	var userId = getUserId();
	var upfile = req.files.upfile
	if (!CONFIG.ads.uploadPath || CONFIG.ads.uploadPath.length == 0) {
		onError('The Upload path is not set.', error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
		return;
	}
	if (!auth.isLogin()) {
		onError('You have to login before uploading files.', error.HTTP_STATUS.UNAUTHORIZED, upfile);
	}

	if (upfile) {
		var con = new db.Database();
		con.begin((err, result) => {
			var fileDAO = new model_file.FileDAO(con);
			fileDAO.insert(upfile.name, userId, (err: any, fileId: number) => {
				if (err) {
					onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
					con.close();
					return;
				}

				var despath = getDestinationDirectory();
				try {
					utilFs.mkdirpSync(despath);
				} catch(err) {
					onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
					con.close();
					return;
				}
	
				fileDAO.update(fileId, despath + '/' + fileId, (err: any) => {
					if (err) {
						onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
						con.close();
						return;
					}
					con.commit((err, result) => {
						if (err) {
							onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
							con.close();
							return;
						}
						// if (!fs.existsSync(despath)) {
						// 	fs.mkdirSync(despath);
						// }
						try {
							fs.renameSync(upfile.path, despath + '/' + fileId);
						} catch(err) {
							onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
							con.close();
							return;
						}
						var body = 'URL=file/' + fileId + '/' + model_file.File.encodePath(upfile.name);
						con.close();
						res.header('Content-Type', 'text/html');
						res.send(body);
					});
				});
			});
		});
	} else {
		res.send("Upload File not exists.", error.HTTP_STATUS.BAD_REQUEST);
	}
}

export var download = function(req: any, res: any) {
	function validate(req:any, res: any) {
		var checks = [];
		if (!req.params) checks.push('Parameter is required.');
		if (req.params && !req.params.id) checks.push('Id is required.');
		if (req.params && req.params.id && !isFinite(req.params.id)) checks.push('Id must be a number.');
		if (req.params && !req.params.fileName) checks.push('File name is required.');

		if (checks.length > 0) {
			// var msg = checks.join('\n');
			// res.send(msg, error.HTTP_STATUS.BAD_REQUEST);
			res.send('File Not Found', error.HTTP_STATUS.NOT_FOUND);
			return false;
		}

		return true;	
	}

	if (!validate(req, res)) return;

	var con = new db.Database();
	var fileDAO = new model_file.FileDAO(con);

	async.waterfall([
		(next) => {
			fileDAO.get(req.params.id, (err: any, file:model_file.File) => next(err, file));
		}, 
		(file:model_file.File, next) => {
			fs.exists(file.path, (exists) => {
				var err = null;
				if (!exists) {
					err = new error.NotFoundError('File Not Found on file system.', {params:req.params, file:file});
				} else if (file.name != req.params.fileName) {
					err = new error.NotFoundError('File Not Found on file system.', {params:req.params, file:file});
				}
				next(err, file);
			});
		}
	], (err:any, file:model_file.File) => {
		if (err) {
			if (err instanceof error.NotFoundError) {
				res.send('File Not Found', error.HTTP_STATUS.NOT_FOUND);
				return;
			} else {
				res.send(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR);
				return;
			}
		}
		res.download(file.path, file.name);
	});
}

