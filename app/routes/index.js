var childProcess = require('child_process');
var fs = require('fs');
var lang = require('./lang');
var dscript = require('./dscript');
var model_user = require('../model/user');
var db = require('../db/db');
var util_auth = require('../util/auth');
var CONFIG = require('config');

exports.index = function (req, res) {
    var page = 'index';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName() };
    }

    if (req.cookies.lang == 'ja') {
        params.lang = lang.lang.ja;
    }

    res.render(page, params);
};

exports.newprojectView = function (req, res) {
    var page = 'newproject';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null, projectId: req.params.id };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), projectId: req.params.id };
    }

    if (req.cookies.lang == 'ja') {
        params.lang = lang.lang.ja;
    }
    res.render(page, params);
};

exports.caseView = function (req, res) {
    var page = 'case';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, caseId: req.params.id };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), caseId: req.params.id };
    }

    if (req.cookies.lang == 'ja') {
        params.lang = lang.lang.ja;
    }

    res.render(page, params);
};

exports.historyListView = function (req, res) {
    var page = 'history';
    var auth = new util_auth.Auth(req, res);
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, caseId: req.params.id };
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), caseId: req.params.id };
    }

    if (req.cookies.lang == 'ja') {
        params.lang = lang.lang.ja;
    }

    res.render(page, params);
};

exports.historyView = function (req, res) {
    var page = 'case';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, caseId: req.params.id, commitHistory: req.params.history };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName(), caseId: req.params.id, commitHistory: req.params.history };
    }

    if (req.cookies.lang == 'ja') {
        params.lang = lang.lang.ja;
    }

    res.render(page, params);
};

exports.exporter = function (req, res) {
    var exec = childProcess.exec;

    var type = req.body.type;
    var mime = "text/plain";

    res.set('Content-type', 'application/octet-stream; charset=utf-8');
    switch (type) {
        case "png":
            mime = "image/png";
            break;
        case "pdf":
            mime = "application/pdf";
            break;
        case "svg":
            res.set('Content-type', 'image/svg+xml');
            res.send(req.body.svg);
            return;
        case "json":
            res.send(req.body.json);
            return;
        case "ds":
            res.set('Content-type', 'text/plain; charset=utf-8');
            var ex = new dscript.DScriptExporter();
            res.send(ex.export(req.body.json));
            return;
        case "sh":
            res.set('Content-type', 'text/plain; charset=utf-8');
            var ex = new dscript.BashExporter();
            res.send(ex.export(req.body.json));
            return;
        default:
            res.send(400, "Bad Request");
            return;
    }

    exec("/bin/mktemp -q /tmp/svg.XXXXXX", function (error, stdout, stderr) {
        var filename = stdout.toString();
        var svgname = filename.trim();
        var resname = filename.trim() + "." + type;
        fs.writeFile(svgname, req.body.svg, function (err) {
            if (err)
                throw err;

            var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
            exec(rsvg_convert, function (r_error, r_stdout, r_stderr) {
                if (r_error)
                    throw r_error;

                var stat = fs.statSync(resname);
                res.set("Content-Length", stat.size);
                res.set("Content-type", mime);
                res.send(fs.readFileSync(resname));
            });
        });
    });
};

exports.login_twitter = function (req, res) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);
    userDAO.login(req.user.displayName, function (err, result) {
        if (err) {
            console.error(err);
            res.redirect(CONFIG.ads.basePath + '/');

            return;
        }
        var auth = new util_auth.Auth(req, res);
        auth.set(result.id, result.loginName);
        res.redirect(CONFIG.ads.basePath + '/');
    });
};

exports.login_facebook = function (req, res) {
    console.log("login_facebook");
    console.log(req.user);
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);
    userDAO.login(req.user.displayName, function (err, result) {
        if (err) {
            console.error(err);
            res.redirect(CONFIG.ads.basePath + '/');

            return;
        }
        var auth = new util_auth.Auth(req, res);
        auth.set(result.id, result.loginName);
        res.redirect(CONFIG.ads.basePath + '/');
    });
};

exports.login = function (req, res) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);

    userDAO.register(req.body.username, "", function (err, result) {
        if (err) {
            return;
        }
        console.log("Registering process successfully ended.");
    });
    userDAO.login(req.body.username, function (err, result) {
        if (err) {
            console.error(err);
            res.redirect(CONFIG.ads.basePath + '/');

            return;
        }
        var auth = new util_auth.Auth(req, res);
        auth.set(result.id, result.loginName);
        res.redirect(CONFIG.ads.basePath + '/');
    });
};

exports.logout = function (req, res) {
    var auth = new util_auth.Auth(req, res);
    auth.clear();
    req.logout();
    res.redirect(CONFIG.ads.basePath + '/');
};

