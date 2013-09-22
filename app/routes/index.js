var childProcess = require('child_process');
var fs = require('fs');
var lang = require('./lang');
var dscript = require('./dscript');
var model_user = require('../model/user');
var db = require('../db/db');
var util_auth = require('../util/auth');
var CONFIG = require('config');

var getBasicParam = function (req, res) {
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null };
    var auth = new util_auth.Auth(req, res);
    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName() };
    }

    return params;
};

exports.index = function (req, res) {
    var params = getBasicParam(req, res);
    res.render('index', params);
};

exports.newcase = function (req, res) {
    var params = getBasicParam(req, res);
    res.render('newcase', params);
};

exports.newproject = function (req, res) {
    var params = getBasicParam(req, res);
    params.projectId = req.params.id;
    res.render('newproject', params);
};

exports.caseview = function (req, res) {
    var params = getBasicParam(req, res);
    params.caseId = req.params.id;
    params.rechost = CONFIG.rec.host;
    params.api = CONFIG.rec.api;
    res.render('case', params);
};

exports.historyList = function (req, res) {
    var params = getBasicParam(req, res);
    params.caseId = req.params.id;
    res.render('history', params);
};

exports.history = function (req, res) {
    var params = getBasicParam(req, res);
    params.caseId = req.params.id;
    params.commitHistory = req.params.history;
    params.rechost = CONFIG.rec.host;
    params.api = CONFIG.rec.api;
    res.render('case', params);
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

