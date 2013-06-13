import model = module('./model')

export class User {
	constructor(public id:number, public loginName: string, public deleteFlag: bool, public systemFlag: bool) {}
}

export class UserDAO extends model.DAO {
	login(loginName: string, password: string, callback: (user: User) => void) {

	}

	register(loginName: string, password: string, callback: (user: User) => void) {
		this.con.query('INSERT INTO user(login_name) VALUES(?) ', [loginName], (err, result) => {
			if (err) {
				this.con.rollback();
				this.con.close();
				throw err;
			}
			this.con.query('SELECT * FROM user WHERE login_name = ? ', [loginName], (err, result) => {
				if (err) {
					this.con.rollback();
					this.con.close();
					throw err;
				}
				var resultUser = new User(result[0].id, result[0].login_name, result[0].delete_flag, result[0].system_flag);
				callback(resultUser);

			});
		});
	}
}