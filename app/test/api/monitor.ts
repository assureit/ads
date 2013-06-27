///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import monitor = module('../../api/monitor')
import error = module('../../api/error')
// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

describe('api', function() {
	describe('monitor', function() {
		describe('modifyMonitorStatus', function() {
			it('system node ID not existing is specified ', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 99999,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, {
					onSuccess: (result: any) => {
						done();
					}, 
					onFailure: (err: any) => {
						expect(err).not.to.be(null);
						expect(err instanceof error.NotFoundError).to.be(true);
						done();
					},
				});
			});
			it('dcaseId not existing is specified ', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 1,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, {
					onSuccess: (result: any) => {
						done();
					}, 
					onFailure: (err: any) => {
						expect(err).not.to.be(null);
						expect(err instanceof error.NotFoundError).to.be(true);
						done();
					},
				});
			});
			it('', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 3,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, {
					onSuccess: (result: any) => {
						done();
					}, 
					onFailure: (err: any) => {
						console.log(err);
						done();
					},
				});
			});
			it('', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 3,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'OK'}, {
					onSuccess: (result: any) => {
						done();
					}, 
					onFailure: (err: any) => {
						console.log(err);
						done();
					},
				});
			});
		});
	});
});
