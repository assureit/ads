///<reference path='../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../db/db')
import testdb = module('../db/test-db')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')
var _ = require('underscore')

export function load(filePathList:string[], callback: (err:any)=>void) {
    var con = new db.Database();
	var testDB = new testdb.TestDB(con);
	async.waterfall([
		(next:Function) => {
			testDB.clearAll((err:any) => next(err));
		}, 
		(next:Function) => {
			testDB.loadAll(buildFilePathList(filePathList), (err:any) => next(err));
		}, 
		(next:Function) => {
			con.close((err:any) => next(err));
		}, 
		], (err:any) => {
			if (err) console.log(err);
			expect(err).to.be(undefined);
			callback(err);
		}
	);
}

export function clear(callback: (err:any)=>void) {
    var con = new db.Database();
	var testDB = new testdb.TestDB(con);
	async.waterfall([
		(next:Function) => {
			testDB.clearAll((err:any) => next(err));
		}, 
		(next:Function) => {
			con.close((err:any) => next(err));
		}, 
		], (err:any) => {
			if (err) console.log(err);
			expect(err).to.be(undefined);
			callback(err);
		}
	);
}

export function begin(filePathList:string[], callback: (err:any, con:db.Database)=>void) {
    var con = new db.Database();
	var testDB = new testdb.TestDB(con);
	async.waterfall([
		(next:Function) => {
			con.begin((err:any, result:any) => next(err));
		},
		(next:Function) => {
			testDB.clearAll((err:any) => next(err));
		}, 
		(next:Function) => {
			testDB.loadAll(buildFilePathList(filePathList), (err:any) => next(err));
		}, 
		], (err:any) => {
			if (err) console.log(err);
			expect(err).to.be(null);
			callback(err, con);
		}
	);
}

function buildFilePathList(filePathList:string[]): string[] {
	return _.uniq(_.union(['test/default-data.yaml'], filePathList));
}