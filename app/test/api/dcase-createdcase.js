
var db = require('../../db/db')
var dcase = require('../../api/dcase')
var error = require('../../api/error')
var constant = require('../../constant')
var testdata = require('../testdata')
var util_test = require('../../util/test')
var model_dcase = require('../../model/dcase')
var model_commit = require('../../model/commit')
var expect = require('expect.js');
var userId = constant.SYSTEM_USER_ID;
describe('api', function () {
    var con;
    var validParam;
    beforeEach(function (done) {
        validParam = {
            dcaseName: 'test dcase',
            contents: {
                NodeCount: 3,
                TopGoalId: 1,
                NodeList: [
                    {
                        ThisNodeId: 1,
                        Description: "dcase1",
                        Children: [
                            2
                        ],
                        NodeType: "Goal"
                    }, 
                    {
                        ThisNodeId: 2,
                        Description: "s1",
                        Children: [
                            3
                        ],
                        NodeType: "Strategy"
                    }, 
                    {
                        ThisNodeId: 3,
                        Description: "g1",
                        Children: [],
                        NodeType: "Goal"
                    }
                ]
            }
        };
        testdata.load([], function (err) {
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
        describe('createDCase', function () {
            it('should return result', function (done) {
                dcase.createDCase(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result.dcaseId).not.to.be(null);
                        expect(result.dcaseId).not.to.be(undefined);
                        expect(result.commitId).not.to.be(null);
                        expect(result.commitId).not.to.be(undefined);
                        var dcaseDAO = new model_dcase.DCaseDAO(con);
                        var commitDAO = new model_commit.CommitDAO(con);
                        dcaseDAO.get(result.dcaseId, function (err, resultDCase) {
                            expect(err).to.be(null);
                            expect(resultDCase.name).to.equal(validParam.dcaseName);
                            commitDAO.get(result.commitId, function (err, resultCommit) {
                                expect(err).to.be(null);
                                expect(resultCommit.latestFlag).to.equal(true);
                                done();
                            });
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('UserId not found', function (done) {
                dcase.createDCase(validParam, -1, {
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
            it('DCase name is empty', function (done) {
                validParam.dcaseName = '';
                dcase.createDCase(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nDCase name is required.');
                        done();
                    }
                });
            });
            it('DCase name is not set', function (done) {
                delete validParam['dcaseName'];
                dcase.createDCase(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nDCase name is required.');
                        done();
                    }
                });
            });
            it('DCase name is too long', function (done) {
                validParam.dcaseName = util_test.str.random(256);
                dcase.createDCase(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nDCase name should not exceed 255 characters.');
                        done();
                    }
                });
            });
            it('contents is not set', function (done) {
                delete validParam['contents'];
                dcase.createDCase(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.equal(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.equal('Invalid method parameter is found: \nContents is required.');
                        done();
                    }
                });
            });
            it('param is null', function (done) {
                dcase.createDCase(null, userId, {
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
            it('param is undefined', function (done) {
                dcase.createDCase(undefined, userId, {
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
        });
    });
});
