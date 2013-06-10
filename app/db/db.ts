///<reference path='../types/mysql.d.ts'/>

import mysql = module('mysql')

export class Database {
	public con: mysql.Connection;

	static getConnection() {
		return mysql.createConnection({
				host: 'localhost',
				user: 'ads_test',
				password: 'ads_test',
				database: 'dcase'
			});
	}

	constructor() {
		this.con = Database.getConnection();
	}

	query(sql:string, callback: mysql.QueryCallback);
	query(sql:string, values:any[], callback: mysql.QueryCallback);
	query(sql: string, values: any, callback?: any) {
		this.con.query(sql, values, callback);
	}

	begin(callback): void {
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

	commit(callback): void {
		this.query('COMMIT', (err, result) => {
			callback(err, result);
		});
	}

	rollback(callback): void {
		this.query('ROLLBACK', (err, query) => {
			callback(err, query);
		});
	}

	endTransaction(callback): void {
		this.query('SET autocommit=1', (err, query) => {
			callback(err, query);
		});
	}

	close(callback?: mysql.QueryCallback) {
		callback = callback || (err, result) => {if (err) throw err;};
		this.con.end(callback);
	}

}
