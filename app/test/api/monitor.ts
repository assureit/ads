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
			var con = new db.Database();

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
			it('status change OK->NG', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 3,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, {
					onSuccess: (result: any) => {
						con.query('select m.dcase_id, c.id, n.this_node_id, n.node_type from monitor_node m, commit c, node n where m.id = 3 and  m.dcase_id = c.dcase_id and c.latest_flag = TRUE AND c.id = n.commit_id and node_type = "Rebuttal";', (err, expectedResult) => {
							expect(err).to.be(null);
							expect(1).to.be(expectedResult.length);

							done();
						});
					}, 
					onFailure: (err: any) => {
						console.log(err);
						done();
					},
				});
			});
			it('status change NG->OK', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 3,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'OK'}, {
					onSuccess: (result: any) => {
						con.query('select m.dcase_id, c.id, n.this_node_id, n.node_type from monitor_node m, commit c, node n where m.id = 3 and  m.dcase_id = c.dcase_id and c.latest_flag = TRUE AND c.id = n.commit_id and node_type = "Rebuttal";', (err, expectedResult) => {

							expect(err).to.be(null);
							expect(0).to.be(expectedResult.length);

							done();
						});
					}, 
					onFailure: (err: any) => {
						console.log(err);
						done();
					},
				});
			});
			con.close();
		});
	});
});
