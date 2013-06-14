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
        var dom = domain.create();
        dom.on('error', function (err) {
            if(con) {
                con.rollback(function (err2, result) {
                    con.close();
                    if(err2) {
                        throw err;
                    }
                    throw err;
                });
            }
        });
        dom.run(function () {
            setTimeout(function () {
                throw 'timeout';
            }, 1000);
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
                    var _this = this;
                    var loginName = 'unittest02';
                    var pwd = 'password';
                    con.errorHandler = {
                        bind: function (callback) {
                            return function (err, result) {
                                if(err) {
                                    console.log('==================================');
                                    expect(err).not.to.be(null);
                                    expect(err instanceof error.DuplicatedError).to.be(true);
                                    _this.con.rollback();
                                    _this.con.close();
                                    done();
                                }
                                callback(err, result);
                            };
                        }
                    };
                    userDAO.register(loginName, pwd, function (result) {
                        userDAO.register(loginName, pwd, function (result) {
                        });
                    });
                });
            });
        });
    });
});
