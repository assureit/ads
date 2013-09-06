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
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: null };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: auth.getLoginName() };
    }

    if (req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
    }

    res.render(page, params);
};

exports.newprojectView = function (req, res) {
    var page = 'newproject';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: null };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: auth.getLoginName() };
    }

    if (req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
    }

    res.render(page, params);
};

exports.caseView = function (req, res) {
    var page = 'case';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, caseId: req.params.id };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: auth.getLoginName(), caseId: req.params.id };
    }

    if (req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
    }

    res.render(page, params);
};

exports.historyListView = function (req, res) {
    var page = 'history';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: null };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: auth.getLoginName() };
    }

    if (req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
    }

    res.render(page, params);
};

exports.historyView = function (req, res) {
    var page = 'case';
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, caseId: req.params.id, commitHistory: req.params.history };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.ja, userName: auth.getLoginName(), caseId: req.params.id, commitHistory: req.params.history };
    }

    if (req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
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

exports.login = function (req, res) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);

    userDAO.login(req.body.username, req.body.password, function (err, result) {
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
    res.redirect(CONFIG.ads.basePath + '/');
};

exports.register = function (req, res) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);

    userDAO.register(req.body.username, req.body.password, function (err, result) {
        if (err) {
            res.redirect(CONFIG.ads.basePath + '/');
            return;
        }
        var auth = new util_auth.Auth(req, res);
        auth.set(result.id, result.loginName);
        res.redirect(CONFIG.ads.basePath + '/');
    });
};

