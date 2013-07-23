
var db = require('../../db/db');
var dcase = require('../../api/dcase');
var error = require('../../api/error');
var constant = require('../../constant');
var testdata = require('../testdata');
var model_dcase = require('../../model/dcase');

var expect = require('expect.js');

var userId = constant.SYSTEM_USER_ID;

describe('api', function () {
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
    describe('dcase', function () {
        describe('deleteDCase', function () {
            it('should return result', function (done) {
                dcase.deleteDCase({ dcaseId: 201 }, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result.dcaseId).not.to.be(null);
                        expect(result.dcaseId).not.to.be(undefined);

                        var dcaseDAO = new model_dcase.DCaseDAO(con);
                        dcaseDAO.get(result.dcaseId, function (err, resultDCase) {
                            expect(err).to.be(null);
                            expect(resultDCase.deleteFlag).to.equal(true);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('UserId Not Found', function (done) {
                dcase.deleteDCase({ dcaseId: 36 }, 99999, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.DATA_NOT_FOUND);
                        expect(err.message).to.be('UserId Not Found.');
                        done();
                    }
                });
            });
            it('prams is null', function (done) {
                dcase.deleteDCase(null, userId, {
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
                dcase.deleteDCase({}, userId, {
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
                dcase.deleteDCase({ dcaseId: "a" }, userId, {
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
            it('DCase Id is not found', function (done) {
                dcase.deleteDCase({ dcaseId: 999 }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.DATA_NOT_FOUND);
                        expect(err.message).to.equal('DCase is not found.');
                        done();
                    }
                });
            });
            it('DCaseID is already deleted.', function (done) {
                dcase.deleteDCase({ dcaseId: 223 }, userId, {
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
});

