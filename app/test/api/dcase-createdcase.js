
var db = require('../../db/db');
var dcase = require('../../api/dcase');
var error = require('../../api/error');
var constant = require('../../constant');
var testdata = require('../testdata');
var util_test = require('../../util/test');
var model_dcase = require('../../model/dcase');
var model_commit = require('../../model/commit');

var expect = require('expect.js');

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function () {
    var con;
    var validParam;
    beforeEach(function (done) {
        validParam = {
            dcaseName: 'test dcase',
            projectId: 201,
            contents: '*1\n' + 'dcase1\n' + '*2\n' + 's1\n' + '**3\n' + 'g1\n'
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
                        expect(resultDCase.projectId).to.equal(validParam.projectId);
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
        it('projectId not found should be projectId=1', function (done) {
            validParam.projectId = null;
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
                        expect(resultDCase.projectId).to.equal(constant.SYSTEM_PROJECT_ID);
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
        it('projectId 0 should be projectId=1', function (done) {
            validParam.projectId = 0;
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
                        expect(resultDCase.projectId).to.equal(constant.SYSTEM_PROJECT_ID);
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
        it('projectId not set should be projectId=1', function (done) {
            delete validParam['projectId'];
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
                        expect(resultDCase.projectId).to.equal(constant.SYSTEM_PROJECT_ID);
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
        it('project not found', function (done) {
            validParam.projectId = 2;
            dcase.createDCase(validParam, userId, {
                onSuccess: function (result) {
                    expect(result).to.be(null);
                    done();
                },
                onFailure: function (err) {
                    expect(err.rpcHttpStatus).to.be(200);
                    expect(err.code).to.be(error.RPC_ERROR.DATA_NOT_FOUND);
                    expect(err.message).to.be('Project Not Found.');
                    done();
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
                    expect(err.code).to.be(error.RPC_ERROR.DATA_NOT_FOUND);
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

