///<reference path='../types/js-yaml.d.ts'/>
import db = module('./db')
import yaml = module('js-yaml')
import fs = module('fs')
var _ = require('underscore');
var async = require('async')
var CONFIG = require('config');

export class TestDB {
	constructor(public con:db.Database) {
		if (process.env.NODE_ENV != 'test') throw 'Using TestDB without NODE_ENV=test';
	}
	/**
	 * ユニットテスト用テストデータのローディング
	 */
	loadAll(filePathList:string[], callback:(err:any)=>void) {
		if(filePathList.length == 0) {
			callback(null);
			return;
		}
		this.load(filePathList[0], (err:any) => {
			if(err){
				callback(err);
				return;
			}
			this.loadAll(filePathList.slice(1), callback);
		});
	}

	/**
	 * ユニットテスト用テストデータのローディング
	 */
	load(filePath:string, callback:(err:any)=>void) {
		// console.log('LOADING: ' + filePath);
		var fd = fs.readFileSync(filePath, 'utf8');
		try {
			yaml.loadAll(fd, (doc) => {
				var tables = _.keys(doc);
				var loadFuncs = _.map(tables, (table)=> {return this._buildLoadTableFunc(table, doc[table])});
				async.waterfall(loadFuncs, (err:any) => {callback(err);});
			});
		} catch (e) {
			callback(e);
			return;
		}
	}

	loadTable(table: string, data: any[], callback: (err:any)=>void) {
		var queryFuncs = _.map(data, (raw) => {
			return this._buildQuery(table, raw);
		});
		if (queryFuncs && queryFuncs.length) {
			async.waterfall(queryFuncs, (err:any) => {callback(err);});
		}
	}

	_buildLoadTableFunc(table:string, data:any[]) {
		return (next:Function) => {
			this.loadTable(table, data, (err:any) => {next(err);});
		};
	}

	_buildQuery(table: string, raw: any): Function {
		var columns = _.keys(raw);
		var sql = 'INSERT INTO ' + table + ' ('
			+ columns.join(', ')
			+ ') VALUES ('
			+ _.map(columns, (c) => {return '?';})
			+ ')';
		var params = _.map(columns, (c:string) => {return raw[c];});
		return (next:Function) => {
			// console.log('LOADING: ' + table + ' ' + JSON.stringify(raw));
			this.con.query(sql, params, (err:any, result:any) => {
				if (err) {
					console.log('LOADING: ' + table + ' ' + JSON.stringify(raw));
					console.log(err);
				}
				next(err);
			});
		};
	}

	clearAll(callback: (err:any)=>void): void {
		this._clearAll(_.map(CONFIG.test.database.tables, (table)=> {return table;}), callback);
	}

	_clearAll(tables:string[], callback: (err:any)=>void) {
		if (tables.length == 0) {
			callback(null);
			return;
		}
		this.clearTable(tables[0], (err:any) => {
			if (err) {
				callback(err);
				return;
			}
			this._clearAll(tables.slice(1), callback);
		});
	}

	clearTable(table:string, callback: (err:any)=>void) {
		// console.log('DELETING: ' + table);
		this.con.query('DELETE FROM ' + table, (err:any, result:any) => {
			callback(err)
		});
	}
}
