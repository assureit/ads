import db = module('../db/db')

export class Model {
	constructor(public con: db.Database) {}
}