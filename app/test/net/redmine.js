
var redmine = require('../../net/redmine');
var expect = require('expect.js');
var CONFIG = require('config');
var express = require('express');

var redmineRequestBody;
var app = express();
app.use(express.bodyParser());
app.post('/issues.json', function (req, res) {
    res.header('Content-Type', 'application/json');
    redmineRequestBody = req.body;
    res.send(JSON.stringify({ "issue": { "id": 3825 } }));
});
app.put('/issues/:itsId', function (req, res) {
    redmineRequestBody = req.body;
    res.send(null, 200);
});

describe('net', function () {
    var server = null;
    before(function (done) {
        CONFIG.redmine.port = 3030;
        server = app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
        CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
        CONFIG.resetRuntime(function (err, written, buffer) {
        });
    });

    describe('redmine', function () {
        var issue = new redmine.Issue();
        describe('createSimple', function () {
            it('should create new issue', function (done) {
                redmineRequestBody = null;
                issue.createSimple('test', 'contents', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.issue).not.to.be(null);
                    expect(result.issue.id).not.to.be(null);
                    expect(redmineRequestBody).not.to.be(null);
                    expect(redmineRequestBody.issue.subject).to.eql('test');
                    expect(redmineRequestBody.issue.description).to.eql('contents');
                    done();
                });
            });
            it('should create new Japanese issue', function (done) {
                redmineRequestBody = null;
                issue.createSimple('タイトル', 'これが内容', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result.issue).not.to.be(null);
                    expect(result.issue.id).not.to.be(null);
                    expect(redmineRequestBody).not.to.be(null);
                    expect(redmineRequestBody.issue.subject).to.eql('タイトル');
                    expect(redmineRequestBody.issue.description).to.eql('これが内容');
                    done();
                });
            });
        });
        describe('addComment', function () {
            it('should create new comment to issue', function (done) {
                issue.addComment("103", 'コメントを追加', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.equal('');
                    expect(redmineRequestBody).not.to.be(null);
                    expect(redmineRequestBody.issue.notes).to.eql('コメントを追加');
                    done();
                });
            });
        });
    });
});

