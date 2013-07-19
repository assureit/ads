
var redmine = require('../../net/redmine');
var expect = require('expect.js');

describe('net', function () {
    describe('redmine', function () {
        var issue = new redmine.Issue();
        describe('createSimple', function () {
            it('should create new issue', function (done) {
                issue.createSimple('test', 'contents', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.issue).not.to.be(null);
                    expect(result.issue.id).not.to.be(null);
                    done();
                });
            });
            it('should create new Japanese issue', function (done) {
                issue.createSimple('タイトル', 'これが内容', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.issue).not.to.be(null);
                    expect(result.issue.id).not.to.be(null);
                    done();
                });
            });
        });
        describe('addComment', function () {
            it('should create new comment to issue', function (done) {
                issue.addComment("103", 'コメントを追加', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.equal('');
                    done();
                });
            });
        });
    });
});

