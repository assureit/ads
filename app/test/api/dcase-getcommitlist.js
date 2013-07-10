
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
        describe('getCommitList', function () {
            it('should return result', function (done) {
                dcase.getCommitList({
                    dcaseId: 201
                }, userId, {
                    onSuccess: function (result) {
                        expect(result.commitList.length > 0).to.be(true);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('prams is null', function (done) {
                dcase.getCommitList(null, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        ;
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nParameter is required.');
                        done();
                    }
                });
            });
            it('DCase Id is not set', function (done) {
                dcase.getCommitList({
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        ;
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nDCase ID is required.');
                        done();
                    }
                });
            });
            it('DCase Id is not a number', function (done) {
                dcase.getCommitList({
                    dcaseId: "a"
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        ;
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nDCase ID must be a number.');
                        done();
                    }
                });
            });
            it('DCase is not found', function (done) {
                dcase.getCommitList({
                    dcaseId: 99999
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        ;
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.NOT_FOUND);
                        expect(err.message).to.equal('Effective DCase does not exist.');
                        done();
                    }
                });
            });
        });
    });
});
