///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import redmine = module('../../net/redmine')

describe('net', () => {
	describe('redmine', () => {
		var issue = new redmine.Issue();
		describe('createSimple', () => {
			it('should create new issue', function(done) {
				issue.createSimple('test', 'contents', (err:any, result:any) => {
					console.log(err);
					console.log(result);
					done();
				});
			});
			// it('should create new Japanese issue', function(done) {
			// 	issue.createSimple('タイトル', 'これが内容', (err:any, result:any) => {
			// 		console.log(err);
			// 		console.log(result);
			// 		done();
			// 	});
			// });
		});
	});
})
