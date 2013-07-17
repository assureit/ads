///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import testdata = module('../testdata')
var expect = require('expect.js');      
var exec = require('child_process').exec


describe('job', function() {
	beforeEach(function (done) {
		testdata.load(['test/default-data.yaml'], (err:any) => {
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});
	describe('monitor', function() {
		describe('cleanMonitor', function() {
			it('Run ', function(done) {
				var cmd = 'npm run-script clean_monitor';
				exec(cmd, function(err, stdout, stderr){
console.log('err=' + err);
console.log("stdout="+stdout);
console.log("stderr="+stderr);
					expect(err).to.be(null);	
					done();
				});
			});
		});
	}) 
})
