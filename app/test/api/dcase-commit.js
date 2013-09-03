
var db = require('../../db/db');
var dcase = require('../../api/dcase');
var error = require('../../api/error');
var constant = require('../../constant');
var testdata = require('../testdata');
var model_commit = require('../../model/commit');
var CONFIG = require('config');

var expect = require('expect.js');
var _ = require('underscore');
var dSvr = require('../server');

var userId = constant.SYSTEM_USER_ID;

describe('api', function () {
    var con;
    var validParam;

    beforeEach(function (done) {
        validParam = {
            commitId: 401,
            commitMessage: 'test',
            contents: '*1\n' + 'dcase1\n' + 'Note0::\n' + '	Type: Issue\n' + '	Subject: このゴールを満たす必要がある\n' + '	Visible: true\n' + '	詳細な情報をここに記述する\n' + 'Note1::\n' + '	Type: LastUpdated\n' + '	User: Shida\n' + '	Visible: false\n' + 'Note2::\n' + '	Type: Tag\n' + '	Tag: tag1\n' + '	Visible: true\n' + '*2\n' + 's1\n' + '**3\n' + 'g1\n' + 'Note0::\n' + '	Type: Issue\n' + '	Subject: 2つ目のイシュー\n' + '	Visible: true\n' + '	あああ詳細な情報をここに記述する\n' + 'Note1::\n' + '	Type: LastUpdated\n' + '	User: Shida\n' + '	Visible: false\n' + 'Note2::\n' + '	Type: Tag\n' + '	Tag: tag1\n' + '	Visible: true\n' + 'Note3::\n' + '	Type: Tag\n' + '	Tag: tag2\n' + '	Visible: true\n' + 'Note4::\n' + '	Type: Tag\n' + '	Tag: newTag\n' + '	Visible: true'
        };
        testdata.load(['test/api/dcase-commit.yaml'], function (err) {
            con = new db.Database();
            dSvr.setResponseOK(true);
            dSvr.setRecRequestBody(null);
            dSvr.setRedmineRequestBody(null);
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });

    var server = null;
    before(function (done) {
        CONFIG.redmine.port = 3030;
        server = dSvr.app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
        CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
        CONFIG.resetRuntime(function (err, written, buffer) {
        });
    });

    describe('dcase', function () {
        describe('commit', function () {
            it('should return result', function (done) {
                this.timeout(15000);
                dcase.commit(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result.commitId).not.to.be(null);
                        expect(result.commitId).not.to.be(undefined);
                        var commitDAO = new model_commit.CommitDAO(con);
                        commitDAO.get(result.commitId, function (err, resultCommit) {
                            expect(err).to.be(null);
                            expect(resultCommit.latestFlag).to.equal(true);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('should atache tags', function (done) {
                this.timeout(15000);
                dcase.commit(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result.commitId).not.to.be(null);
                        expect(result.commitId).not.to.be(undefined);
                        con.query('SELECT t.* FROM tag t, dcase_tag_rel r WHERE t.id = r.tag_id AND r.dcase_id=? ORDER BY t.label', [201], function (err, result) {
                            var resultTags = _.map(result, function (it) {
                                return it.label;
                            });
                            var expectTags = ['newTag', 'tag1', 'tag2'];
                            expect(expectTags).to.eql(resultTags);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('UserId not found', function (done) {
                this.timeout(15000);
                dcase.commit(validParam, 99999, {
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
                this.timeout(15000);
                dcase.commit(null, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nParameter is required.');
                        done();
                    }
                });
            });
            it('commit id is not set', function (done) {
                this.timeout(15000);
                delete validParam['commitId'];
                dcase.commit(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nCommit ID is required.');
                        done();
                    }
                });
            });
            it('commit id is not a number', function (done) {
                this.timeout(15000);
                validParam.commitId = "a";
                dcase.commit(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nCommit ID must be a number.');
                        done();
                    }
                });
            });

            it('contents is not set', function (done) {
                this.timeout(15000);
                delete validParam['contents'];
                dcase.commit(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nContents is required.');
                        done();
                    }
                });
            });
            it('Version Conflict', function (done) {
                this.timeout(15000);
                validParam.commitId = 404;
                dcase.commit(validParam, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.DATA_VERSION_CONFLICT);
                        expect(err.message).to.be('CommitID is not the effective newest commitment.');
                        done();
                    }
                });
            });
        });
    });
});

