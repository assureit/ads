
var db = require('../../db/db')
var dcase = require('../../api/dcase')
var error = require('../../api/error')
var constant = require('../../constant')
var testdata = require('../testdata')
var expect = require('expect.js');
var userId = constant.SYSTEM_USER_ID;
describe('api', function () {
    var con;
    beforeEach(function (done) {
        testdata.load([
            'test/api/dcase.yaml'
        ], function (err) {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('dcase', function () {
        describe('deleteDCase', function () {
            it('should return result', function (done) {
                dcase.deleteDCase({
                    dcaseId: 201
                }, userId, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('UserId Not Found', function (done) {
                dcase.deleteDCase({
                    dcaseId: 36
                }, 99999, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.NOT_FOUND);
                        expect(err.message).to.be('UserId Not Found.');
                        done();
                    }
                });
            });
        });
        describe('editDCase', function () {
            it('should return result', function (done) {
                dcase.editDCase({
                    dcaseId: 201,
                    dcaseName: 'modified dcase name'
                }, userId, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('UserId Not Found', function (done) {
                dcase.editDCase({
                    dcaseId: 201,
                    dcaseName: 'modified dcase name'
                }, 99999, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.NOT_FOUND);
                        expect(err.message).to.be('UserId Not Found.');
                        done();
                    }
                });
            });
        });
    });
});
