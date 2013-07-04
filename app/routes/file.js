var db = require('../db/db')
var constant = require('../constant')
var model_file = require('../model/file')
var fs = require('fs')
var utilFs = require('../util/fs')
exports.upload = function (req, res) {
    function onError(err, upfile) {
        if(fs.existsSync(upfile.path)) {
            fs.unlink(upfile.path, function (err) {
                if(err) {
                    throw err;
                }
                res.send(err);
            });
        } else {
            res.send(err);
        }
    }
    function getDestinationDirectory() {
        var d = new Date();
        var yy = String(d.getFullYear());
        var mm = String(d.getMonth() + 1);
        var dd = String(d.getDate());
        if(mm.length == 1) {
            mm = '0' + mm;
        }
        if(dd.length == 1) {
            dd = '0' + dd;
        }
        return 'upload/' + yy + '/' + mm + '/' + dd;
    }
    function getUserId() {
        var userId = constant.SYSTEM_USER_ID;
        var cookies = {
        };
        req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            cookies[parts[0].trim()] = (parts[1] || '').trim();
        });
        if(cookies['userId']) {
            userId = Number(cookies['userId']);
        }
        return userId;
    }
    var userId = getUserId();
    var upfile = req.files.upfile;
    if(upfile) {
        var con = new db.Database();
        con.begin(function (err, result) {
            var fileDAO = new model_file.FileDAO(con);
            fileDAO.insert(upfile.name, userId, function (err, fileId) {
                if(err) {
                    onError(err, upfile);
                    return;
                }
                var despath = getDestinationDirectory();
                utilFs.mkdirpSync(despath);
                fileDAO.update(fileId, despath + '/' + fileId, function (err) {
                    if(err) {
                        onError(err, upfile);
                        return;
                    }
                    con.commit(function (err, result) {
                        if(err) {
                            onError(err, upfile);
                            return;
                        }
                        fs.renameSync(upfile.path, despath + '/' + fileId);
                        var body = 'URL=' + 'file/' + fileId;
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
};
exports.download = function (req, res) {
    var con = new db.Database();
    var fileDAO = new model_file.FileDAO(con);
    fileDAO.select(req.params.id, function (err, path, name) {
        if(err) {
            res.send(err);
            return;
        }
        fs.exists(path, function (exists) {
            if(exists) {
                res.download(path, name);
            } else {
                res.send(404, 'File Not Found');
            }
        });
    });
};
