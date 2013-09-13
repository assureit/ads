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

export var index = function(req: any, res: any) {
	var page = 'index';
	var params: any = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null};
	var auth = new util_auth.Auth(req, res);
	if(auth.isLogin()) {
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName() };
	}

	if( req.cookies.lang == 'ja') {
		params.lang = lang.lang.ja;
	}

	res.render(page, params);
};

export var newprojectView = function(req: any, res: any) {
	var page = 'newproject';
	var params: any = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null, projectId: req.params.id};
	var auth = new util_auth.Auth(req, res);
	if(auth.isLogin()) {
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), projectId: req.params.id};
	}

	if( req.cookies.lang == 'ja') {
		params.lang = lang.lang.ja;
	}
	res.render(page, params);
}

export var caseView = function(req: any, res: any) {
	var page = 'case';
	var params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, caseId: req.params.id};
	var auth = new util_auth.Auth(req, res);
	if(auth.isLogin()) {
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), caseId: req.params.id };
	}

	if( req.cookies.lang == 'ja') {
		params.lang = lang.lang.ja;
	}

	res.render(page, params);
};

export var historyListView = function(req: any, res: any) {
	var page = 'history';
	var auth = new util_auth.Auth(req, res);
	var params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, caseId: req.params.id};
	if(auth.isLogin()) {
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), caseId: req.params.id };
	}

	if( req.cookies.lang == 'ja') {
		params.lang = lang.lang.ja;
	}

	res.render(page, params);
};

export var historyView = function(req: any, res: any) {
	var page = 'case';
	var params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, caseId: req.params.id, commitHistory: req.params.history};
	var auth = new util_auth.Auth(req, res);
	if(auth.isLogin()) {
		params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), caseId: req.params.id, commitHistory: req.params.history};
	}

	if( req.cookies.lang == 'ja') {
		params.lang = lang.lang.ja;
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

export var login = function(req: any, res: any) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	
	userDAO.login(req.body.username, req.body.password, (err:any, result: model_user.User) => {
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
	res.redirect(CONFIG.ads.basePath+'/');
};

export var register = function(req: any, res: any) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);

	userDAO.register(req.body.username, req.body.password, req.body.mailAddress, (err:any, result: model_user.User) => {
		if (err) {
			// TODO: display error information
			res.redirect(CONFIG.ads.basePath+'/');
			return;
		}
		var auth = new util_auth.Auth(req, res);
		auth.set(result.id, result.loginName);
		res.redirect(CONFIG.ads.basePath+'/');
	});

};
