import db = module('../db/db')

export class DAO {
	constructor(public con: db.Database) {}
}