
var db = require('../../db/db');
var expect = require('expect.js');

describe('db', function () {
    describe('query', function () {
        it('should return result', function (done) {
            var con = new db.Database();
            con.query('SELECT 1', function (err, result) {
                expect(err).to.be(null);
                expect(result.length).to.equal(1);
                expect(result[0]['1']).to.equal(1);
                con.close(function (err, result) {
                });
                done();
            });
        });
    });
});

