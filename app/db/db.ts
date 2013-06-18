///<reference path='../types/mysql.d.ts'/>

import mysql = module('mysql')
import events = module('events')

export class Database extends events.EventEmitter {
	public con: mysql.Connection;

	static getConnection() {
		return mysql.createConnection({
				host: 'localhost',
				user: 'ads_test',
				password: 'ads_test',
				database: 'ads'
			});
	}

	constructor() {
		super();
		this.con = Database.getConnection();
	}

	// TODO: ちゃんとした型定義
	query(sql:string, 	callback: mysql.QueryCallback);
	query(sql:string, 	values:any[], 	callback: mysql.QueryCallback);
	query(sql:any, 		values:any[], 	callback: mysql.QueryCallback);
	query(sql: string, 	values: any, 	callback?: any) {
		// console.log('QUERY: ' + sql);
		if (callback === undefined && typeof values === 'function') {
			callback = values;
		}

		callback = this._bindErrorHandler(callback);

		if (this.con) {
			this.con.query(sql, values, callback);
		} else {
			callback('Connection is closed');
		}
	}

	begin(callback: mysql.QueryCallback): void {
		this.query('SET autocommit=0', (err, result) => {
			if (err) {
				callback(err, result);
			} else {
				this.query('START TRANSACTION', (err, result) => {
					callback(err, result);
				});
			}
		});
	}

	commit(callback: mysql.QueryCallback): void {
		this.query('COMMIT', (err, result) => {
			callback(err, result);
		});
	}

	rollback(callback?: mysql.QueryCallback): void {
		callback = callback || (err, result) => {if (err) throw err;};
		if (this.con) {
			this.query('ROLLBACK', callback);
		} else {
			callback(null, null);
		}
	}

	_rollback(callback?: mysql.QueryCallback): void {
		callback = callback || (err, result) => {if (err) throw err;};
		if (this.con) {
			// don't call this.query. it occure recursive rollback with _bind_ErrorHandler.
			this.con.query('ROLLBACK', (err, query) => {
				callback(err, query);
			});
		} else {
			callback(null, null);
		}
	}

	endTransaction(callback: mysql.QueryCallback): void {
		this.query('SET autocommit=1', (err, query) => {
			callback(err, query);
		});
	}

	close(callback?: mysql.QueryCallback) {
		callback = callback || (err, result) => {if (err) throw err;};
		if (this.con) {
			this.con.end(callback);
			this.con = null;
		}
	}

	_bindErrorHandler(callback: mysql.QueryCallback): mysql.QueryCallback {
		return (err: any, result:any) => {
			if (err) {
				this._rollback((err:any, result:any) => {
					this.close();
				});
				this.emit('error', err);
				throw err;
			}
			callback(err, result);
		};
	}
}
