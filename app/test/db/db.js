var assert = require('assert')
var db = require('../../db/db')
describe('db', function () {
    describe('query', function () {
        it('should return result', function (done) {
            var con = new db.Database();
            con.query('SELECT 1', function (err, result) {
                assert.strictEqual(err, null);
                assert.equal(1, result.length);
                assert.equal(result[0]['1'], 1);
                con.close(function (err, result) {
                });
                done();
            });
        });
    });
});
