var db = require('../db/db')
var constant = require('../constant')
var model_file = require('../model/file')
var fs = require('fs')
var utilFs = require('../util/fs')
var error = require('../api/error')
var CONFIG = require('config');
exports.upload = function (req, res) {
    function onError(err, errorCode, upfile) {
        if(fs.existsSync(upfile.path)) {
            fs.unlink(upfile.path, function (err2) {
                if(err2) {
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
        return CONFIG.ads.uploadPath + '/' + yy + '/' + mm + '/' + dd;
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
    if(!CONFIG.ads.uploadPath || CONFIG.ads.uploadPath.length == 0) {
        onError('The Upload path is not set.', error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
        return;
    }
    if(upfile) {
        var con = new db.Database();
        con.begin(function (err, result) {
            var fileDAO = new model_file.FileDAO(con);
            fileDAO.insert(upfile.name, userId, function (err, fileId) {
                if(err) {
                    onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
                    con.close();
                    return;
                }
                var despath = getDestinationDirectory();
                try  {
                    utilFs.mkdirpSync(despath);
                } catch (err) {
                    onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
                    con.close();
                    return;
                }
                fileDAO.update(fileId, despath + '/' + fileId, function (err) {
                    if(err) {
                        onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
                        con.close();
                        return;
                    }
                    con.commit(function (err, result) {
                        if(err) {
                            onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
                            con.close();
                            return;
                        }
                        try  {
                            fs.renameSync(upfile.path, despath + '/' + fileId);
                        } catch (err) {
                            onError(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
                            con.close();
                            return;
                        }
                        var body = 'URL=' + 'file/' + fileId;
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
};
exports.download = function (req, res) {
    function validate(req, res) {
        var checks = [];
        if(!req.params) {
            checks.push('Parameter is required.');
        }
        if(req.params && !req.params.id) {
            checks.push('Id is required.');
        }
        if(req.params && req.params.id && !isFinite(req.params.id)) {
            checks.push('Id must be a number.');
        }
        if(checks.length > 0) {
            var msg = checks.join('\n');
            res.send(msg, error.HTTP_STATUS.BAD_REQUEST);
            return false;
        }
        return true;
    }
    if(!validate(req, res)) {
        return;
    }
    var con = new db.Database();
    var fileDAO = new model_file.FileDAO(con);
    fileDAO.select(req.params.id, function (err, path, name) {
        if(err) {
            if(err.code == error.RPC_ERROR.DATA_NOT_FOUND) {
                res.send('File Not Found', error.HTTP_STATUS.NOT_FOUND);
                return;
            } else {
                res.send(err);
                return;
            }
        }
        fs.exists(path, function (exists) {
            if(exists) {
                res.download(path, name);
            } else {
                res.send('File Not Found', error.HTTP_STATUS.NOT_FOUND);
            }
        });
    });
};
