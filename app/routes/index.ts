///<reference path='../DefinitelyTyped/node/node.d.ts'/>
import childProcess = module('child_process')
import fs           = module('fs')
import lang       = module('./lang')
import dscript    = module('./dscript')
import model_user = module('../model/user')
import db         = module('../db/db')
import util_auth = module('../util/auth')
var CONFIG = require('config')
//import ex = module('./exporter')

var getBasicParam = function(req: any, res: any) {
	var params: any = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null};
	var auth = new util_auth.Auth(req, res);
	if(auth.isLogin()) {
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName() };
	}
	//if( req.cookies.lang == 'ja') {
	//	params.lang = lang.lang.ja;
	//}
	return params;
}

export var index = function(req: any, res: any) {
	var params: any = getBasicParam(req, res);
	res.render('index', params);
}

export var newcase = function(req: any, res: any) {
	var params: any = getBasicParam(req, res);
	res.render('newcase', params);
}

export var newproject = function(req: any, res: any) {
	var params: any = getBasicParam(req, res);
	params.projectId = req.params.id;
	res.render('newproject', params);
}

export var caseview = function(req: any, res: any) {
	var params: any = getBasicParam(req, res);
	params.caseId = req.params.id;
	res.render('case', params);
}

export var historyList = function(req: any, res: any) {
	var params: any = getBasicParam(req, res);
	params.caseId = req.params.id;
	res.render('history', params);
}

export var history = function(req: any, res: any) {
	var params: any = getBasicParam(req, res);
	params.caseId = req.params.id;
	params.commitHistory = req.params.history;
	res.render('case', params);
}

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
		case "sh":
			res.set('Content-type','text/plain; charset=utf-8');
			var ex = new dscript.BashExporter();
			res.send(ex.export(req.body.json));
			return;
		default:
			res.send(400, "Bad Request");
			return;
	}

	exec("/bin/mktemp -q /tmp/svg.XXXXXX", (error, stdout, stderr) => {
		var filename :string = stdout.toString();
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

export var login_twitter = function(req: any, res: any) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	userDAO.login(req.user.displayName, (err:any, result: model_user.User) => {
		if (err) {
			// TODO: display error information
			console.error(err);
			res.redirect(CONFIG.ads.basePath+'/');
			// res.redirect('/');
			return;
		}
		var auth = new util_auth.Auth(req, res);
		auth.set(result.id, result.loginName);
		res.redirect(CONFIG.ads.basePath+'/');
	});
}

export var login_facebook = function(req: any, res: any) {
	console.log("login_facebook");
	console.log(req.user);
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	userDAO.login(req.user.displayName, (err:any, result: model_user.User) => {
		if (err) {
			// TODO: display error information
			console.error(err);
			res.redirect(CONFIG.ads.basePath+'/');
			// res.redirect('/');
			return;
		}
		var auth = new util_auth.Auth(req, res);
		auth.set(result.id, result.loginName);
		res.redirect(CONFIG.ads.basePath+'/');
	});
}

export var login = function(req: any, res: any) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	
	userDAO.register(req.body.username, "", (err:any, result: model_user.User) => {
		if (err) {
			/* do nothing */
			return;
		}
		console.log("Registering process successfully ended.");
	});
	userDAO.login(req.body.username, (err:any, result: model_user.User) => {
		if (err) {
			// TODO: display error information
			console.error(err);
			res.redirect(CONFIG.ads.basePath+'/');
			// res.redirect('/');
			return;
		}
		var auth = new util_auth.Auth(req, res);
		auth.set(result.id, result.loginName);
		res.redirect(CONFIG.ads.basePath+'/');
	});
};

export var logout = function(req: any, res: any) {
	var auth = new util_auth.Auth(req, res);
	auth.clear();
	req.logout();
	res.redirect(CONFIG.ads.basePath+'/');
};

//export var register = function(req: any, res: any) {
//	var con = new db.Database();
//	var userDAO = new model_user.UserDAO(con);
//
//	userDAO.register(req.body.username, req.body.password, req.body.mailAddress, (err:any, result: model_user.User) => {
//		if (err) {
//			// TODO: display error information
//			res.redirect(CONFIG.ads.basePath+'/');
//			return;
//		}
//		var auth = new util_auth.Auth(req, res);
//		auth.set(result.id, result.loginName);
//		res.redirect(CONFIG.ads.basePath+'/');
//	});
//
//};
