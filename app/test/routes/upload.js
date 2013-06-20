var db = require('../../db/db')
var model_user = require('../../model/file')


var expect = require('expect.js');
describe('model', function () {
    describe('file', function () {
        var con;
        var userDAO;
        beforeEach(function (done) {
            con = new db.Database();
            con.begin(function (err, result) {
                userDAO = new model_user.FileDAO(con);
                done();
            });
        });
        afterEach(function (done) {
            if(con) {
                con.rollback(function (err, result) {
                    con.close();
                    if(err) {
                        throw err;
                    }
                    done();
                });
            }
        });
        describe('register', function () {
            it('should insert data to file table', function (done) {
                var Name = 'unittest01';
                var userId = 1;
                userDAO.insert(Name, userId, function (err, result) {
                    con.query('SELECT *  FROM file WHERE id = ? ', [
                        result
                    ], function (err, expectedResult) {
                        expect(err).to.be(null);
                        expect(result).to.be(expectedResult[0].id);
                        console.log(result);
                        done();
                    });
                });
            });
        });
    });
});
