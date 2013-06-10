var db = require('../db/db')

var constant = require('../constant')
function getDCaseList(params, callback) {
    var con = new db.Database();
    con.query('SELECT * FROM dcase', function (err, result) {
        if(err) {
            con.close();
            throw err;
        }
        con.close();
        var list = [];
        result.forEach(function (val) {
            list.push({
                dcaseId: val.id,
                dcaseName: val.name
            });
        });
        callback.onSuccess(list);
    });
}
exports.getDCaseList = getDCaseList;
function createDCase(params, callback) {
    var userId = constant.SYSTEM_USER_ID;
    var con = new db.Database();
    con.begin(function (err, result) {
        con.query('INSERT INTO dcase(user_id, name) VALUES (?, ?)', [
            userId, 
            params.dcaseName
        ], function (err, result) {
            if(err) {
                con.rollback();
                con.close();
                throw err;
            }
            var dcaseId = result.insertId;
            con.query('INSERT INTO commit(data, date_time, prev_commit_id, latest_flag,  dcase_id, `user_id`, `message`) VALUES(?,now(),?,TRUE,?,?,?)', [
                JSON.stringify(params.contents), 
                0, 
                dcaseId, 
                userId, 
                'Initial Commit'
            ], function (err, result) {
                if(err) {
                    con.rollback();
                    con.close();
                    throw err;
                }
                var commitId = result.insertId;
                con.commit(function (err, result) {
                    callback.onSuccess({
                        dcaseId: dcaseId,
                        commitId: commitId
                    });
                    con.close();
                });
            });
        });
    });
}
exports.createDCase = createDCase;
