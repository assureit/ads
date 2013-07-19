var model_pager = require('../../model/pager')
var expect = require('expect.js');
describe('model', function () {
    describe('pager', function () {
        describe('getMaxPage', function () {
            it('result=10', function (done) {
                var pager = new model_pager.Pager(1);
                pager.totalItems = 100;
                pager.limit = 10;
                expect(pager.getMaxPage()).to.eql(10);
                done();
            });
        });
        describe('getCurrentPage', function () {
            it('page set 1', function (done) {
                var pager = new model_pager.Pager(1);
                expect(pager.getCurrentPage()).to.eql(1);
                done();
            });
            it('page set -1', function (done) {
                var pager = new model_pager.Pager(-1);
                expect(pager.getCurrentPage()).to.eql(1);
                done();
            });
            it('page set 0', function (done) {
                var pager = new model_pager.Pager(0);
                expect(pager.getCurrentPage()).to.eql(1);
                done();
            });
            it('page set 100', function (done) {
                var pager = new model_pager.Pager(100);
                expect(pager.getCurrentPage()).to.eql(100);
                done();
            });
        });
        describe('getOffset', function () {
            it('page=1, limit=10, result=0', function (done) {
                var pager = new model_pager.Pager(1);
                pager.limit = 10;
                expect(pager.getOffset()).to.eql(0);
                done();
            });
            it('page=10, limit=10, result=90', function (done) {
                var pager = new model_pager.Pager(10);
                pager.limit = 10;
                expect(pager.getOffset()).to.eql(90);
                done();
            });
        });
    });
});
