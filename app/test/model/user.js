var db = require('../../db/db')
var model_user = require('../../model/user')
var error = require('../../api/error')
var domain = require('domain')
var expect = require('expect.js');
describe('model', function () {
    describe('user', function () {
        var con;
        var userDAO;
        beforeEach(function (done) {
            con = new db.Database();
            con.begin(function (err, result) {
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
                var loginName = 'unittest02';
                var pwd = 'password';
                var d = domain.create();
                d.add(userDAO);
                d.add(userDAO.con);
                d.on('error', function (err) {
                    expect(err).not.to.be(null);
                    expect(err instanceof error.DuplicatedError).to.be(true);
                    done();
                });
                d.run(function () {
                    userDAO.register(loginName, pwd, function (result) {
                        userDAO.register(loginName, pwd, function (result) {
                        });
                    });
                });
            });
        });
    });
});
