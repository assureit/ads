///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_user = module('../../model/user')
import error = module('../../api/error')
import domain = module('domain')
import testdata = module('../testdata')
import util_test = module('../../util/test')
var expect = require('expect.js');	// TODO: import module化
var ldap = require('ldapjs');		// TODO: import module化
var CONFIG = require('config');

describe('model', function() {
	describe('user', function() {
		var con: db.Database
		var userDAO: model_user.UserDAO;
		beforeEach((done) => {
			testdata.begin(['test/default-data.yaml'], (err:any, c:db.Database) => {
				con = c;
				userDAO = new model_user.UserDAO(con);

				var client = ldap.createClient({url: CONFIG.ldap.url});
				var entry = {
					cn: 'system',
					sn: 'system',
					objectClass: 'inetOrgPerson',
					userPassword: 'password'
					};

				client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function(err) {
					var dn = CONFIG.ldap.dn.replace('$1', 'system');
					client.add(dn, entry, function(err) {
						client.unbind(function(err) {
							done();
						});
					});
				});
			});
		});

		afterEach((done) => {
			con.rollback((err, result) => {
				con.close();
				if (err) {
					throw err;
				}
				CONFIG.ldap.root = CONFIG.getOriginalConfig().ldap.root;
				CONFIG.resetRuntime(function(err, written, buffer) {
					var client = ldap.createClient({url: CONFIG.ldap.url});
					client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function(err) {
						var dn = CONFIG.ldap.dn.replace('$1', 'unittest01');
						client.del(dn, function(err) {
							var dn2 = CONFIG.ldap.dn.replace('$1', 'unittest02');
							client.del(dn2, function(err) {
								var dn3 = CONFIG.ldap.dn.replace('$1', 'system');
								client.del(dn3, function(err) {
									client.unbind(function(err) {
										done();
									});
								});
							});
						});
					});
				});
			});
		});

		describe('register', function() {
			it('should return User object property', function(done) {
				var loginName = 'unittest01';
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err: any, result: model_user.User) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result.loginName).to.eql(loginName);
					done();
				});
			});
			it('should insert data to user table', function(done) {
				var loginName = 'unittest01';
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {

					con.query('SELECT id, login_name, delete_flag, system_flag FROM user WHERE login_name = ? ', [loginName],(err, expectedResult) => {
						expect(err).to.be(null);

						expect(result.id).to.be(expectedResult[0].id);
						expect(result.loginName).to.be(expectedResult[0].login_name);
						expect(result.deleteFlag).to.eql(expectedResult[0].delete_flag);
						expect(result.systemFlag).to.eql(expectedResult[0].system_flag);

						done();
					});
				});


			});
			it('The login name is already registered into LDAP. ', function(done) {
				var loginName = 'unittest02';
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).to.be(null);
					userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
						expect(err).not.to.be(null);
						expect(err instanceof error.LoginError).to.be(true);
						expect(err.message).to.be('Login Name is already exist.');
						done();
					});
				});
			});
			it('can not register if login name is duplicated', function(done) {
				var loginName = 'unittest02';
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).to.be(null);
					var client = ldap.createClient({url: CONFIG.ldap.url});
					client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function(err) {
						var dn = CONFIG.ldap.dn.replace('$1', 'unittest02');
						client.del(dn, function(err) {
							client.unbind(function(err) {
								userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
									expect(err).not.to.be(null);
									expect(err instanceof error.DuplicatedError).to.be(true);
									done();
								});
							});
						});
					});
				});
			});
			it('Login name is empty', function(done) {
				var loginName = '';
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.InvalidParamsError).to.be(true);
					expect(err.rpcHttpStatus).to.be(200);
					expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
					expect(err.message).to.equal('Invalid method parameter is found: \nLogin name is required.');
					done();
				});
			});
			it('Login name is too long', function(done) {
				var loginName = util_test.str.random(46);
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.InvalidParamsError).to.be(true);
					expect(err.rpcHttpStatus).to.be(200);
					expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
					expect(err.message).to.equal('Invalid method parameter is found: \nLogin name should not exceed 45 characters.');
					done();
				});
			});
			it('Password is empty', function(done) {
				var loginName = 'system';
				var pwd = '';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.InvalidParamsError).to.be(true);
					expect(err.rpcHttpStatus).to.be(200);
					expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
					expect(err.message).to.equal('Invalid method parameter is found: \nPassword is required.');
					done();
				});
			});
			it('root account authority went wrong', function(done) {
				var loginName = 'unittest02';
				var pwd = 'password';
				CONFIG.ldap.root = '';
				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.ExternalParameterError).to.be(true);
					expect(err.rpcHttpStatus).to.be(200);
					expect(err.code).to.equal(error.RPC_ERROR.CONFIG_ERROR);
					expect(err.message).to.equal('root account authority went wrong.');
					done();
				});
			});
		});
		describe('login', function() {
			it('should return User object property', function(done) {
				var loginName = 'system';
				var pwd = 'password';

				userDAO.login(loginName, pwd, (err:any, result: model_user.User) => {
					expect(result).not.to.be(undefined);
					expect(result.loginName).to.eql(loginName);
					done();
				});
			});
			it('OpenLDAP auth error', function(done) {
				var loginName = 'NoSetData';
				var pwd = 'password';

				userDAO.login(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.LoginError).to.be(true);
					done();
				});
			});
			it('Login name is empty', function(done) {
				var loginName = '';
				var pwd = 'password';

				userDAO.login(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.InvalidParamsError).to.be(true);
					expect(err.rpcHttpStatus).to.be(200);
					expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
					expect(err.message).to.equal('Invalid method parameter is found: \nLogin name is required.');
					done();
				});
			});
			it('Login name is too long', function(done) {
				var loginName = util_test.str.random(46);
				var pwd = 'password';

				userDAO.login(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.InvalidParamsError).to.be(true);
					expect(err.rpcHttpStatus).to.be(200);
					expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
					expect(err.message).to.equal('Invalid method parameter is found: \nLogin name should not exceed 45 characters.');
					done();
				});
			});
		});
	});
});
