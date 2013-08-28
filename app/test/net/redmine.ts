///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import redmine = module('../../net/redmine')
var expect = require('expect.js');	// TODO: import module化
var CONFIG = require('config')
var dSvr = require('../server')

describe('net', () => {
	var server = null;
	before((done) => {
		console.log(JSON.stringify(CONFIG.redmine));
		CONFIG.redmine.port = 3030;
		server = dSvr.app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
		CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
		CONFIG.resetRuntime((err, written, buffer) => {});
	});

	beforeEach((done) => {
		dSvr.setRedmineRequestBody(null);
		done();
	});

	describe('redmine', () => {
		var issue = new redmine.Issue();
		describe('createSimple', () => {
			it('should create new issue', function(done) {
				issue.createSimple('test', 'contents', (err:any, result:any) => {
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
			it('should create new Japanese issue', function(done) {
				issue.createSimple('タイトル', 'これが内容', (err:any, result:any) => {
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
		describe('addComment', () => {
			it('should create new comment to issue', function(done) {
				issue.addComment("103", 'コメントを追加', (err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).to.equal('');
					expect(dSvr.getRedmineRequestBody()).not.to.be(null);
					expect(dSvr.getRedmineRequestBody().issue.notes).to.eql('コメントを追加');
					done();
				});
			});
		});
	});
})
