
var db = require('../../db/db')
var testdb = require('../../db/test-db')
var expect = require('expect.js');
describe('test-db', function () {
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
    describe('load', function () {
        it('should load yaml data to database tables', function (done) {
            testDB.load('test/default-data.yaml', function (err) {
                con.query('SELECT count(*) as cnt FROM USER WHERE id=101', function (err, result) {
                    console.log(result);
                    expect(result.length).to.equal(1);
                    expect(result[0].cnt).to.equal(1);
                    done();
                });
            });
        });
    });
});
