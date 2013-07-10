
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
        describe('getNodeTree', function () {
            it('should return result', function (done) {
                dcase.getNodeTree({
                    commitId: 401
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result.contents).not.to.be(null);
                        expect(result.contents).not.to.be(undefined);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('prams is null', function (done) {
                dcase.getNodeTree(null, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
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
            it('Commit ID is not set', function (done) {
                dcase.getNodeTree({
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nCommit ID is required.');
                        done();
                    }
                });
            });
            it('Commit ID is not a number', function (done) {
                dcase.getNodeTree({
                    commitId: "a"
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nCommit ID must be a number.');
                        done();
                    }
                });
            });
            it('Commit is not found', function (done) {
                dcase.getNodeTree({
                    commitId: 99999
                }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.NOT_FOUND);
                        expect(err.message).to.equal('Effective Commit does not exist.');
                        done();
                    }
                });
            });
        });
    });
});
