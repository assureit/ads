var db = require('../db/db')
var constant = require('../constant')
var model_file = require('../model/file')
var fs = require('fs')
exports.upload = function (req, res) {
    function onError(err, upfile) {
        if(fs.existsSync(upfile.path)) {
            fs.unlinkSync(upfile.path);
        }
        res.send(err);
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
        return 'upload/' + yy + mm + dd;
    }
    var userId = constant.SYSTEM_USER_ID;
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
                        if(!fs.existsSync(despath)) {
                            fs.mkdirSync(despath);
                        }
                        fs.renameSync(upfile.path, despath + '/' + fileId);
                        console.log(req);
                        var body = {
                            URL: 'http://tekitou.com/file/' + fileId
                        };
                        con.close();
                        res.send(body, 200);
                    });
                });
            });
        });
    } else {
    }
};
exports.test = function (req, res) {
    res.end('request end');
    console.log('hoge');
};
