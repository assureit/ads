///<reference path='../types/js-yaml.d.ts'/>
import db = module('./db')
import yaml = module('js-yaml')
import fs = module('fs')
var _ = require('underscore');
var async = require('async')

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
		}
		this.load(filePathList[0], (err:any) => {
			this.loadAll(filePathList.slice(1), callback);
		});
	}

	/**
	 * ユニットテスト用テストデータのローディング
	 */
	load(filePath:string, callback:(err:any)=>void) {
		var fd = fs.readFileSync(filePath, 'utf8');
		yaml.loadAll(fd, (doc) => {
			var tables = _.keys(doc);
			var loadFuncs = _.map(tables, (table)=> {return this._buildLoadTableFunc(table, doc[table])});
			async.waterfall(loadFuncs, (err:any) => {callback(err);});
		});
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
			console.log('LOADING: ' + table + ' ' + JSON.stringify(raw));
			this.con.query(sql, params, (err:any, result:any) => {next(err);});
		};
	}
}
