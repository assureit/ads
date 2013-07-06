///<reference path='../DefinitelyTyped/node/node.d.ts'/>
import childProcess = module('child_process')
import fs           = module('fs')
import lang       = module('./lang')
import dscript    = module('./dscript')
import model_user = module('../model/user')
import db         = module('../db/db')
var CONFIG = require('config')
//import ex = module('./exporter')

export var index = function(req: any, res: any) {
	var page = 'signin';
	var params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja };
	if(req.cookies.userId != null) {
		page = 'signout';
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: req.cookies.userName };
	}

	if( req.cookies.lang == 'en') {
		params.lang = lang.lang.en;
	}

	res.render(page, params);
};


export var exporter = function(req: any, res: any) {
	var exec = childProcess.exec;

	var type = req.body.type;
	var mime = "text/plain";

	res.set('Content-type','application/octet-stream; charset=utf-8');
	switch(type) {
		case "png":
			mime = "image/png";
			break;
		case "pdf":
			mime = "application/pdf";
			break;
		case "svg":
			res.set('Content-type','image/svg+xml');
			res.send(req.body.svg);
			return;
		case "json":
			res.send(req.body.json);
			return;
		case "ds":
			res.set('Content-type','text/plain; charset=utf-8');
			var ex = new dscript.DScriptExporter();
			res.send(ex.export(req.body.json));
			return;
		default:
			res.send(400, "Bad Request");
			return;
	}

	exec("/bin/mktemp -q /tmp/svg.XXXXXX", (error, stdout, stderr) => {
		var filename :string = stdout;
		var svgname  :string = filename.trim();
		var resname = filename.trim() + "." + type;
		fs.writeFile(svgname, req.body.svg, (err) => {
			if (err) throw err;

			var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
			exec(rsvg_convert, (r_error, r_stdout, r_stderr) => {
				if(r_error) throw r_error;

				var stat = fs.statSync(resname);
				res.set("Content-Length", stat.size);
				res.set("Content-type", mime);
				res.send(fs.readFileSync(resname));
			});
		});
	});

};

export var login = function(req: any, res: any) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	
	userDAO.login(req.body.username, req.body.password, (err:any, result: model_user.User) => {
		if (err) {
			//TODO:エラー表示
			res.redirect('/');
			return;
		}
		res.cookie('userId',result.id);
		res.cookie('userName',result.loginName);
		res.redirect('/');
	});
};

export var logout = function(req: any, res: any) {
	res.clearCookie('userId');
	res.clearCookie('userName');
	res.redirect('/');
};

export var register = function(req: any, res: any) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);

	userDAO.register(req.body.username, req.body.password, (err:any, result: model_user.User) => {
		if (err) {
			// TODO:エラー表示
			res.redirect('/');
			return;
		}
		res.cookie('userId', result.id);
		res.cookie('userName', result.loginName);
		res.redirect('/');
	});

};
