///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import redmine = module('../../net/redmine')
var expect = require('expect.js');	// TODO: import module化
var CONFIG = require('config')
var express = require('express');

var redmineRequestBody:any;
var app = express();
app.use(express.bodyParser());
app.post('/issues.json', function (req: any, res: any) {
	res.header('Content-Type', 'application/json');
	redmineRequestBody = req.body;
	res.send(JSON.stringify({"issue":{"id":3825}}));
});
app.put('/issues/:itsId', function(req: any, res:any) {
	redmineRequestBody = req.body;
	res.send(null, 200);
});

describe('net', () => {
	var server = null;
	before((done) => {
		CONFIG.redmine.port = 3030;
		server = app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
		CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
		CONFIG.resetRuntime((err, written, buffer) => {});
	});

	describe('redmine', () => {
		var issue = new redmine.Issue();
		describe('createSimple', () => {
			it('should create new issue', function(done) {
				redmineRequestBody = null;
				issue.createSimple('test', 'contents', (err:any, result:any) => {
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
			it('should create new Japanese issue', function(done) {
				redmineRequestBody = null;
				issue.createSimple('タイトル', 'これが内容', (err:any, result:any) => {
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
		describe('addComment', () => {
			it('should create new comment to issue', function(done) {
				issue.addComment("103", 'コメントを追加', (err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).to.equal('');
					expect(redmineRequestBody).not.to.be(null);
					expect(redmineRequestBody.issue.notes).to.eql('コメントを追加');
					done();
				});
			});
		});
	});
})
