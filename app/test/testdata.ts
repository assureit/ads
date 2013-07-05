///<reference path='../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../db/db')
import testdb = module('../db/test-db')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')


export function load(filePathList:string[], callback: (err:any)=>void) {
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
			testDB.load('test/default-data.yaml', (err:any) => next(err));
		}, 
		(next:Function) => {
			con.commit((err:any) => next(err));
		}, 
		(next:Function) => {
			con.close((err:any) => next(err));
		}, 
		], (err:any) => {
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
			con.begin((err:any, result:any) => next(err));
		},
		(next:Function) => {
			testDB.clearAll((err:any) => next(err));
		}, 
		(next:Function) => {
			con.commit((err:any) => next(err));
		}, 
		(next:Function) => {
			con.close((err:any) => next(err));
		}, 
		], (err:any) => {
			expect(err).to.be(undefined);
			callback(err);
		}
	);
}
