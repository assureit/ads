///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

import assert = module('assert')
import db = module('../../db/db')
import testdb = module('../../db/test-db')
var expect = require('expect.js');	// TODO: import module化

describe('test-db', () => {
    var con;
    var testDB;
    beforeEach(function (done) {
        con = new db.Database();
        con.begin(function (err, result) {
        	testDB = new testdb.TestDB(con);
            done();
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
			testDB.load('test/default-data.yaml', (err:any) => {
				con.query('SELECT count(*) as cnt FROM USER WHERE id=101', (err:any, result:any) => {
					expect(result.length).to.equal(1);
					expect(result[0].cnt).to.equal(1);
					done();
				});
			});
		});
	});
});
