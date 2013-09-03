///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

import assert = module('assert')
import db = module('../../db/db')
import testdb = module('../../db/test-db')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')

describe('test-db', () => {
    var con;
    var testDB;
    beforeEach(function (done) {
        con = new db.Database();
        con.begin(function (err, result) {
        	testDB = new testdb.TestDB(con);
        	testDB.clearAll((err:any)=> {
	            done();
        	});
        });
    });
    afterEach(function (done) {
        if(con) {
            con.rollback(function (err, result) {
                con.close();
                if(err) {
                    throw err;
                }
                done();
            });
        }
    });
	describe('load', () => {
		it('should load yaml data to database tables', (done) => {
			async.waterfall([
				(next:Function) => {
					testDB.load('test/default-data.yaml', (err:any) => {next(err);});
				}, 
				(next:Function) => {
					con.query('SELECT count(*) as cnt FROM user WHERE id=101', (err:any, result:any) => {
						expect(result.length).to.equal(1);
						expect(result[0].cnt).to.equal(1);
						next(err);
					});
				}, 
				], (err:any) => {
					expect(err).to.be(null);
					done();
				}
			);
		});
	});

	describe('clearAll', () => {
		it('should clear all database tables', (done) => {
			async.waterfall([
				(next:Function) => {
					testDB.load('test/default-data.yaml', (err:any) => {next(err);});
				}, 
				(next:Function) => {
					testDB.clearAll((err:any) => {
						expect(err).to.be(null);
						next(err);
					});
				}, 
				(next:Function) => {
					con.query('SELECT count(*) as cnt FROM user WHERE id=101', (err:any, result:any) => {
						expect(result.length).to.equal(1);
						expect(result[0].cnt).to.equal(0);
						next(err);
					});
				}, 
				], (err:any) => {
					expect(err).to.be(null);
					done();
				}
			);
		});
	});
});
