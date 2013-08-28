
var redmine = require('../../net/redmine');
var expect = require('expect.js');
var CONFIG = require('config');
var dSvr = require('../server');

describe('net', function () {
    var server = null;
    before(function (done) {
        console.log(JSON.stringify(CONFIG.redmine));
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
        dSvr.setRedmineRequestBody(null);
        done();
    });

    describe('redmine', function () {
        var issue = new redmine.Issue();
        describe('createSimple', function () {
            it('should create new issue', function (done) {
                issue.createSimple('test', 'contents', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.issue).not.to.be(null);
                    expect(result.issue.id).not.to.be(null);
                    expect(dSvr.getRedmineRequestBody()).not.to.be(null);
                    expect(dSvr.getRedmineRequestBody().issue.subject).to.eql('test');
                    expect(dSvr.getRedmineRequestBody().issue.description).to.eql('contents');
                    done();
                });
            });
            it('should create new Japanese issue', function (done) {
                issue.createSimple('タイトル', 'これが内容', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.issue).not.to.be(null);
                    expect(result.issue.id).not.to.be(null);
                    expect(dSvr.getRedmineRequestBody()).not.to.be(null);
                    expect(dSvr.getRedmineRequestBody().issue.subject).to.eql('タイトル');
                    expect(dSvr.getRedmineRequestBody().issue.description).to.eql('これが内容');
                    done();
                });
            });
        });
        describe('addComment', function () {
            it('should create new comment to issue', function (done) {
                issue.addComment("103", 'コメントを追加', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.equal('');
                    expect(dSvr.getRedmineRequestBody()).not.to.be(null);
                    expect(dSvr.getRedmineRequestBody().issue.notes).to.eql('コメントを追加');
                    done();
                });
            });
        });
    });
});

