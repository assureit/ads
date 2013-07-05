import model = module('./model')
import domain = module('domain')
import error = module('../api/error')
import net_ldap = module('../net/ldap')

export class User {
	constructor(public id:number, public loginName: string, public deleteFlag: bool, public systemFlag: bool) {}
}

export class UserDAO extends model.DAO {
	login(loginName: string, password: string, callback: (err:any, user: User) => void) {
		var ldap = new net_ldap.Ldap();
		
		ldap.auth(loginName, password, (err: any) => {
			if (err) {
				err = new error.LoginError('Login name or Password is invalid.');
				callback(err, null);
				return;
			}

			this.selectName(loginName, (err, resultSelect) => {
				if (err) {
					callback(err, null);
					return;
				}

				if (resultSelect) {
					callback(err, resultSelect);
					return;
				} else {
					this.insert(loginName, (err, resultInsert) => {
						if (err) {
							callback(err, null);
							return;
						}
						callback(null, resultInsert);
						return;
					});
				}

			});
		});
	}

	register(loginName: string, password: string, callback: (err:any, user: User) => void) {
		var ldap = new net_ldap.Ldap();
		ldap.add(loginName, password, (err: any) => {
			if (err) {
				err = new error.InternalError('OpenLDAP registration failure', err );
				callback(err, null);
				return;
			}
			this.insert(loginName, (err, resultInsert) => {
				if (err) {
					callback(err, null);
					return;
				}
				callback(null, resultInsert);
			});
		});
	}

	select(id: number, callback: (err:any, user: User) => void) {
		this.con.query('SELECT * FROM user WHERE id = ? ', [id], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			var resultUser : User = null;
			if (result.length == 0) {
				err = new error.NotFoundError('UserId Not Found.');
			} else {
				resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
			}	
			callback(err, resultUser);
		});

	}


	selectName(loginName: string, callback: (err:any, user:User) => void) {
		this.con.query('SELECT * FROM user WHERE login_name = ? ', [loginName], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			var resultUser : User = null;
			if (result.length > 0) {
				resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
			}	
			callback(err, resultUser);
		});

	}


	insert(loginName: string, callback: (err:any, user:User) => void) {
		// this.con.on('error', (err) => {
		// 	if (err.code == 'ER_DUP_ENTRY') {
		// 		throw new error.DuplicatedError('The login name is already exist.');
		// 	}
		// });
		this.con.query('INSERT INTO user(login_name) VALUES(?) ', [loginName], (err, result) => {
			if (err) {
				if (err.code == 'ER_DUP_ENTRY') {
					err = new error.DuplicatedError('The login name is already exist.');
				}
				callback(err, null);
				return;
			}
			this.con.query('SELECT * FROM user WHERE login_name = ? ', [loginName], (err, result) => {
				if (err) {
					callback(err, null);
				}
				var resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
				callback(err, resultUser);

			});
		});
	}
}
