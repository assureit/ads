import model = module('./model')

export class User {
	constructor(public id:number, public loginName: string, public deleteFlag: bool, public systemFlag: bool) {}
}

export class UserDAO extends model.DAO {
	// function login(loginName, password)
}