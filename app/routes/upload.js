var db = require('../db/db')
var constant = require('../constant')
var model_file = require('../model/file')
exports.upload = function (req, res) {
    function onError(err) {
        console.log(err);
        res.send(err);
    }
    function onSuccess() {
        console.log('OK');
        res.send('OK');
    }
    var userId = constant.SYSTEM_USER_ID;
    var con = new db.Database();
    var fileDAO = new model_file.FileDAO(con);
    console.log('aaa');
    fileDAO.insert(req.files.upfile.name, userId, function (err, fileId) {
        console.log('bbb');
        if(err) {
            onError(err);
            return;
        }
        con.close();
        console.log('momo');
    });
};
exports.test = function (req, res) {
    res.end('request end');
    console.log('hoge');
};
