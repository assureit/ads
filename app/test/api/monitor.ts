///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import monitor = module('../../api/monitor')
import error = module('../../api/error')
import constant = module('../../constant')
// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var userId = constant.SYSTEM_USER_ID;

describe('api', function() {
	describe('monitor', function() {

		var con = new db.Database();
		con.query('INSERT INTO monitor_node(dcase_id, this_node_id) VALUE (12, 2)', (err, expectedResult) => {
			con.close();
		});

		describe('modifyMonitorStatus', function() {
			it('system node ID not existing is specified ', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 99999,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
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
							     systemNodeId: 1,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, userId, {
					onSuccess: (result: any) => {
						var con = new db.Database();
						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = 1 AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', (err, expectedResult) => {
							expect(err).to.be(null);
							expect(1).to.be(expectedResult.length);
							con.close();
							done();
						});
					}, 
					onFailure: (err: any) => {
						expect(err).not.to.be(null);
						done();
					},
				});
			});
			it('status change NG->OK', function(done) {
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: 1,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'OK'}, userId, {
					onSuccess: (result: any) => {
						var con = new db.Database();
						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = 1 AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', (err, expectedResult) => {
							expect(err).to.be(null);
							expect(0).to.be(expectedResult.length);
							con.close();
							done();
						});
					}, 
					onFailure: (err: any) => {
						expect(err).not.to.be(null);
						done();
					},
				});
			});
		});
	});
});
