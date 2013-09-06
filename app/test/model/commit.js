
var model_commit = require('../../model/commit');




var testdata = require('../testdata');
var expect = require('expect.js');
var async = require('async');
var CONFIG = require('config');
var dSvr = require('../server');

describe('model', function () {
    var testDB;
    var con;
    var commitDAO;
    var validParam;

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

    beforeEach(function (done) {
        validParam = {
            commitId: 401,
            commitMessage: 'test',
            contents: '*goal\n' + 'dcase1\n' + 'Tag::tag1\n\n' + '*strategy\n' + 's1\n\n' + '**goal\n' + 'g1\n' + 'Tag::tag1,tag2,newTag'
        };

        testdata.begin(['test/default-data.yaml', 'test/model/commit.yaml'], function (err, c) {
            con = c;
            commitDAO = new model_commit.CommitDAO(con);
            dSvr.setResponseOK(true);
            dSvr.setRedmineRequestBody(null);
            dSvr.setRecRequestBody(null);
            done();
        });
    });
    afterEach(function (done) {
        con.rollback(function (err, result) {
            con.close();
            if (err) {
                throw err;
            }
            done();
        });
    });
    describe('commit', function () {
        describe('insert', function () {
            it('normal end', function (done) {
                var params = {
                    data: JSON.stringify(validParam.contents),
                    prevId: 401,
                    dcaseId: 201,
                    userId: 1,
                    message: validParam.commitMessage
                };
                commitDAO.insert(params, function (err, commitId) {
                    expect(err).to.be(null);
                    expect(commitId).not.to.be(null);
                    con.query('SELECT * FROM commit WHERE id=?', [commitId], function (err, result) {
                        expect(err).to.be(null);
                        expect(result[0].id).to.be(commitId);

                        con.query('SELECT * FROM commit WHERE id = 401', function (err, result) {
                            expect(err).to.be(null);
                            expect(result[0].latest_flag).to.eql(false);
                            done();
                        });
                    });
                });
            });
            it('dcase id is not exists ', function (done) {
                var params = {
                    data: JSON.stringify(validParam.contents),
                    prevId: 401,
                    dcaseId: 999,
                    userId: 1,
                    message: validParam.commitMessage
                };
                commitDAO.insert(params, function (err, commitId) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
        });
        describe('update', function () {
            it('normal end', function (done) {
                commitDAO.update(401, 'update test', function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM commit WHERE id=401', function (err, result) {
                        expect(err).to.be(null);
                        expect(result[0].data).to.eql('update test');
                        done();
                    });
                });
            });
        });
        describe('_clearLastUpdateFlag', function () {
            it('normal end', function (done) {
                commitDAO._clearLastUpdateFlag(201, 999, function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM commit WHERE dcase_id=201', function (err, result) {
                        expect(err).to.be(null);
                        expect(result[0].latest_flag).to.eql(false);
                        done();
                    });
                });
            });
        });
        describe('get', function () {
            it('normal end', function (done) {
                commitDAO.get(401, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    con.query('SELECT * FROM commit WHERE id=401', function (err, resultEx) {
                        expect(err).to.be(null);
                        expect(result.id).to.eql(resultEx[0].id);
                        expect(result.prevCommitId).to.eql(resultEx[0].prev_commit_id);
                        expect(result.dcaseId).to.eql(resultEx[0].dcase_id);
                        expect(result.userId).to.eql(resultEx[0].user_id);
                        expect(result.message).to.eql(resultEx[0].message);
                        expect(result.data).to.eql(resultEx[0].data);
                        expect(result.dateTime).to.eql(resultEx[0].date_time);
                        expect(result.latestFlag).to.eql(resultEx[0].latest_flag);
                        done();
                    });
                });
            });
        });
        describe('list', function () {
            it('normal end', function (done) {
                commitDAO.list(201, function (err, list) {
                    expect(err).to.be(null);
                    expect(list).not.to.be(null);
                    expect(list).not.to.be(undefined);
                    con.query('SELECT * FROM commit WHERE dcase_id=201 ORDER BY id', function (err, result) {
                        expect(err).to.be(null);
                        expect(list.length).to.eql(result.length);
                        expect(list[0].id).to.eql(result[0].id);
                        expect(list[0].prevCommitId).to.eql(result[0].prev_commit_id);
                        expect(list[0].dcaseId).to.eql(result[0].dcase_id);
                        expect(list[0].userId).to.eql(result[0].user_id);
                        expect(list[0].message).to.eql(result[0].message);
                        expect(list[0].data).to.eql(result[0].data);
                        expect(list[0].dateTime).to.eql(result[0].date_time);
                        expect(list[0].latestFlag).to.eql(result[0].latest_flag);
                        done();
                    });
                });
            });
        });
        describe('commit', function () {
            it('normal end', function (done) {
                this.timeout(15000);
                commitDAO.commit(1, 401, 'commit test', validParam.contents, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.commitId).not.to.be(null);
                    expect(result.commitId).not.to.be(undefined);
                    con.query('SELECT * FROM commit WHERE id=?', [result.commitId], function (err, resultCommit) {
                        expect(err).to.be(null);
                        expect(resultCommit[0].latest_flag).to.eql(true);
                        done();
                    });
                });
            });
        });
    });
});

