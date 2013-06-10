///<reference path='../types/mysql.d.ts'/>
///<reference path='../types/future.d.ts'/>

import mysql = module('mysql')
var Fiber = require('fibers')
var Future = require('fibers/future')

var fs = require('fs');

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

	query(sql: string, values?: any[]) {
		values = values || [];
		var connect = Future.wrap(function() {this.con.connect(arguments);});
		var query = Future.wrap(function() {this.con.query(arguments)});

		Fiber(function() {
			var result = connect().wait();
			console.log(result);
			var callbackResult = {};

			var result2 = query(sql, values, function(err, result) {
				callbackResult['err'] = err;
				callbackResult['result'] = result;
				console.log('hoge2');
				console.log(result);
				return result;
			}).wait();
			console.log(result2);
		}).run();
	}

}
