
var db = require('../../db/db');
var dcase = require('../../api/dcase');
var error = require('../../api/error');
var constant = require('../../constant');
var testdata = require('../testdata');
var model_dcase = require('../../model/dcase');
var model_commit = require('../../model/commit');

var expect = require('expect.js');

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function () {
    var con;
    beforeEach(function (done) {
        testdata.load(['test/api/dcase.yaml'], function (err) {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('getDCase', function () {
        it('should return result', function (done) {
            dcase.getDCase({ dcaseId: 201 }, userId, {
                onSuccess: function (result) {
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.commitId).not.to.be(null);
                    expect(result.commitId).not.to.be(undefined);
                    expect(result.dcaseName).not.to.be(null);
                    expect(result.dcaseName).not.to.be(undefined);
                    expect(result.contents).not.to.be(null);
                    expect(result.contents).not.to.be(undefined);
                    var dcaseDAO = new model_dcase.DCaseDAO(con);
                    var commitDAO = new model_commit.CommitDAO(con);
                    commitDAO.get(result.commitId, function (err, resultCommit) {
                        expect(err).to.be(null);
                        expect(resultCommit.latestFlag).to.equal(true);
                        dcaseDAO.get(resultCommit.dcaseId, function (err, resultDCase) {
                            expect(err).to.be(null);
                            expect(resultDCase.name).to.equal(result.dcaseName);
                            expect(resultDCase.deleteFlag).to.equal(false);
                            done();
                        });
                    });
                },
                onFailure: function (err) {
                    expect().fail(JSON.stringify(err));
                    done();
                }
            });
        });
        it('prams is null', function (done) {
            dcase.getDCase(null, userId, {
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
        it('DCase Id is not set', function (done) {
            dcase.getDCase({}, userId, {
                onSuccess: function (result) {
                    expect(result).to.be(null);
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
            dcase.getDCase({ dcaseId: "a" }, userId, {
                onSuccess: function (result) {
                    expect(result).to.be(null);
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
            dcase.getDCase({ dcaseId: 999 }, userId, {
                onSuccess: function (result) {
                    expect(result).to.be(null);
                    done();
                },
                onFailure: function (err) {
                    expect(err.rpcHttpStatus).to.be(200);
                    expect(err.code).to.equal(error.RPC_ERROR.DATA_NOT_FOUND);
                    expect(err.message).to.equal('Effective DCase does not exist.');
                    done();
                }
            });
        });
    });
});

