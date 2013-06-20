///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_user = module('../../model/user')
import error = module('../../api/error')
import domain = module('domain')
var expect = require('expect.js');	// TODO: import module化


describe('model', function() {
	describe('user', function() {
		var con: db.Database
		var userDAO: model_user.UserDAO;
		beforeEach((done) => {
			con = new db.Database();
			con.begin((err, result) => {
				userDAO = new model_user.UserDAO(con);
				done();
			});
		});

		afterEach((done) => {
			if (con) {
				con.rollback((err, result) => {
					con.close();
					if (err) {
						throw err;
					}
					done();
				});
			}
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
			it('can not register if login name is duplicated', function(done) {
				var loginName = 'unittest02';
				var pwd = 'password';

				userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).to.be(null);
					userDAO.register(loginName, pwd, (err:any, result: model_user.User) => {
						expect(err).not.to.be(null);
						expect(err instanceof error.DuplicatedError).to.be(true);
						done();
					});
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
			it('login user not found', function(done) {
				var loginName = 'NoSetData';
				var pwd = 'password';

				userDAO.login(loginName, pwd, (err:any, result: model_user.User) => {
					expect(err).not.to.be(null);
					expect(err instanceof error.LoginError).to.be(true);
					done();
				});
			});
		});
	});
});
