var db = require('../../db/db')
var model_user = require('../../model/user')
var expect = require('expect.js');
describe('model', function () {
    describe('user', function () {
        var con;
        var userDAO;
        beforeEach(function (done) {
            con = new db.Database();
            con.begin(function (err, result) {
                if(err) {
                    con.close();
                    throw err;
                }
                userDAO = new model_user.UserDAO(con);
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
            it('should return User object property', function (done) {
                var loginName = 'unittest01';
                var pwd = 'password';
                userDAO.register(loginName, pwd, function (result) {
                    expect(result).not.to.be(undefined);
                    expect(result.loginName).to.eql(loginName);
                    done();
                });
            });
            it('should insert data to user table', function (done) {
                var loginName = 'unittest01';
                var pwd = 'password';
                userDAO.register(loginName, pwd, function (result) {
                    con.query('SELECT id, login_name, delete_flag, system_flag FROM user WHERE login_name = ? ', [
                        loginName
                    ], function (err, expectedResult) {
                        if(err) {
                            throw err;
                        }
                        expect(result.id).to.be(expectedResult[0].id);
                        expect(result.loginName).to.be(expectedResult[0].login_name);
                        expect(result.deleteFlag).to.eql(expectedResult[0].delete_flag);
                        expect(result.systemFlag).to.eql(expectedResult[0].system_flag);
                        done();
                    });
                });
            });
            it('can not register if login name is duplicated', function (done) {
                done();
            });
        });
    });
});
