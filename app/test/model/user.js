var db = require('../../db/db')
var model_user = require('../../model/user')
var error = require('../../api/error')

var expect = require('expect.js');
var ldap = require('ldapjs');
var CONFIG = require('config');
describe('model', function () {
    describe('user', function () {
        var con;
        var userDAO;
        beforeEach(function (done) {
            con = new db.Database();
            con.begin(function (err, result) {
                userDAO = new model_user.UserDAO(con);
                var client = ldap.createClient({
                    url: CONFIG.ldap.url
                });
                var entry = {
                    cn: 'system',
                    sn: 'system',
                    objectClass: 'inetOrgPerson',
                    userPassword: 'password'
                };
                client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function (err) {
                    var dn = CONFIG.ldap.dn.replace('$1', 'system');
                    client.add(dn, entry, function (err) {
                        client.unbind(function (err) {
                            done();
                        });
                    });
                });
            });
        });
        afterEach(function (done) {
            if(con) {
                con.rollback(function (err, result) {
                    con.close();
                    if(err) {
                        throw err;
                    }
                    var client = ldap.createClient({
                        url: CONFIG.ldap.url
                    });
                    client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function (err) {
                        var dn = CONFIG.ldap.dn.replace('$1', 'unittest01');
                        client.del(dn, function (err) {
                            var dn2 = CONFIG.ldap.dn.replace('$1', 'unittest02');
                            client.del(dn2, function (err) {
                                var dn3 = CONFIG.ldap.dn.replace('$1', 'system');
                                client.del(dn3, function (err) {
                                    client.unbind(function (err) {
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
        describe('register', function () {
            it('should return User object property', function (done) {
                var loginName = 'unittest01';
                var pwd = 'password';
                userDAO.register(loginName, pwd, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.loginName).to.eql(loginName);
                    done();
                });
            });
            it('should insert data to user table', function (done) {
                var loginName = 'unittest01';
                var pwd = 'password';
                userDAO.register(loginName, pwd, function (err, result) {
                    con.query('SELECT id, login_name, delete_flag, system_flag FROM user WHERE login_name = ? ', [
                        loginName
                    ], function (err, expectedResult) {
                        expect(err).to.be(null);
                        expect(result.id).to.be(expectedResult[0].id);
                        expect(result.loginName).to.be(expectedResult[0].login_name);
                        expect(result.deleteFlag).to.eql(expectedResult[0].delete_flag);
                        expect(result.systemFlag).to.eql(expectedResult[0].system_flag);
                        done();
                    });
                });
            });
            it('The login name is already registered into LDAP. ', function (done) {
                var loginName = 'unittest02';
                var pwd = 'password';
                userDAO.register(loginName, pwd, function (err, result) {
                    expect(err).to.be(null);
                    userDAO.register(loginName, pwd, function (err, result) {
                        expect(err).not.to.be(null);
                        expect(err instanceof error.InternalError).to.be(true);
                        expect(err.message).to.be('Internal error: OpenLDAP registration failure');
                        done();
                    });
                });
            });
            it('can not register if login name is duplicated', function (done) {
                var loginName = 'unittest02';
                var pwd = 'password';
                userDAO.register(loginName, pwd, function (err, result) {
                    expect(err).to.be(null);
                    var client = ldap.createClient({
                        url: CONFIG.ldap.url
                    });
                    client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function (err) {
                        var dn = CONFIG.ldap.dn.replace('$1', 'unittest02');
                        client.del(dn, function (err) {
                            client.unbind(function (err) {
                                userDAO.register(loginName, pwd, function (err, result) {
                                    expect(err).not.to.be(null);
                                    expect(err instanceof error.DuplicatedError).to.be(true);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        describe('login', function () {
            it('should return User object property', function (done) {
                var loginName = 'system';
                var pwd = 'password';
                userDAO.login(loginName, pwd, function (err, result) {
                    expect(result).not.to.be(undefined);
                    expect(result.loginName).to.eql(loginName);
                    done();
                });
            });
            it('login user not found', function (done) {
                var loginName = 'NoSetData';
                var pwd = 'password';
                userDAO.login(loginName, pwd, function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err instanceof error.LoginError).to.be(true);
                    done();
                });
            });
        });
    });
});
