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
				if (err) {
					con.close();
					throw err;
				}
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

		var dom = domain.create();

		dom.on('error', (err) => {
			if (con) {
				con.rollback((err2, result) => {
					con.close();
					if (err2) {
						throw err;
					}
					throw err;
				});
			}
		});


		dom.run(() => {
			setTimeout(() => {
				throw 'timeout';
			}, 1000);
			describe('register', function() {
				it('should return User object property', function(done) {
					var loginName = 'unittest01';
					var pwd = 'password';

					userDAO.register(loginName, pwd, (result: model_user.User) => {
						expect(result).not.to.be(undefined);
						expect(result.loginName).to.eql(loginName);
						done();
					});
				});
				it('should insert data to user table', function(done) {
					var loginName = 'unittest01';
					var pwd = 'password';

					userDAO.register(loginName, pwd, (result: model_user.User) => {

						con.query('SELECT id, login_name, delete_flag, system_flag FROM user WHERE login_name = ? ', [loginName],(err, expectedResult) => {
							if (err) {
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
				it('can not register if login name is duplicated', function(done) {
					var loginName = 'unittest02';
					var pwd = 'password';

					con.on('error', (err: any) => {
						expect(err).not.to.be(null);
						expect(err instanceof error.DuplicatedError).to.be(true);
						done();
					});

	// 				con.errorHandler = {
	// bind: (callback) => {
	// 	return (err: any, result:any) => {
	// 		if (err) {
	// 			console.log('==================================');
	// 			expect(err).not.to.be(null);
	// 			expect(err instanceof error.DuplicatedError).to.be(true);
	// 			this.con.rollback();
	// 			this.con.close();
	// 			done();
	// 		}
	// 		callback(err, result);
	// 	};
	// }
					// };

					userDAO.register(loginName, pwd, (result: model_user.User) => {
						userDAO.register(loginName, pwd, (result: model_user.User) => {
						});
					});
				});
			});
		});
	});
});
