///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import redmine = module('../../net/redmine')
var expect = require('expect.js');	// TODO: import module化

describe('net', () => {
	describe('redmine', () => {
		var issue = new redmine.Issue();
		describe('createSimple', () => {
			it('should create new issue', function(done) {
				issue.createSimple('test', 'contents', (err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result.issue).not.to.be(null);
					expect(result.issue.id).not.to.be(null);
					done();
				});
			});
			it('should create new Japanese issue', function(done) {
				issue.createSimple('タイトル', 'これが内容', (err:any, result:any) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result.issue).not.to.be(null);
					expect(result.issue.id).not.to.be(null);
					done();
				});
			});
		});
	});
})
