var db = require('../db/db')
var constant = require('../constant')
var model_file = require('../model/file')
var fs = require('fs')
var utilFs = require('../util/fs')
var error = require('../api/error')
var util_auth = require('../util/auth')
var async = require('async');
var CONFIG = require('config');
exports.upload = function (req, res) {
    var auth = new util_auth.Auth(req, res);
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
        var userId = auth.getUserId();
        if(!userId) {
            userId = constant.SYSTEM_USER_ID;
        }
        return userId;
    }
    var userId = getUserId();
    var upfile = req.files.upfile;
    if(!CONFIG.ads.uploadPath || CONFIG.ads.uploadPath.length == 0) {
        onError('The Upload path is not set.', error.HTTP_STATUS.INTERNAL_SERVER_ERROR, upfile);
        return;
    }
    if(!auth.isLogin()) {
        onError('You have to login before uploading files.', error.HTTP_STATUS.UNAUTHORIZED, upfile);
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
        if(req.params && !req.params.fileName) {
            checks.push('File name is required.');
        }
        if(checks.length > 0) {
            res.send('File Not Found', error.HTTP_STATUS.NOT_FOUND);
            return false;
        }
        return true;
    }
    if(!validate(req, res)) {
        return;
    }
    var con = new db.Database();
    var fileDAO = new model_file.FileDAO(con);
    async.waterfall([
        function (next) {
            fileDAO.get(req.params.id, function (err, file) {
                return next(err, file);
            });
        }, 
        function (file, next) {
            fs.exists(file.path, function (exists) {
                var err = null;
                if(!exists) {
                    err = new error.NotFoundError('File Not Found on file system.', {
                        params: req.params,
                        file: file
                    });
                } else if(file.getEncodeName() != req.params.fileName) {
                    err = new error.NotFoundError('File Not Found on file system.', {
                        params: req.params,
                        file: file
                    });
                }
                next(err, file);
            });
        }    ], function (err, file) {
        if(err) {
            if(err instanceof error.NotFoundError) {
                res.send('File Not Found', error.HTTP_STATUS.NOT_FOUND);
                return;
            } else {
                res.send(err, error.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                return;
            }
        }
        res.download(file.path, file.name);
    });
};
