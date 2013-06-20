import db = module('../db/db')
import events = module('events')

export class DAO extends events.EventEmitter {
	constructor(public con: db.Database) {
		super();
	}
}