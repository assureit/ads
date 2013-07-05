///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import monitor = module('../../api/monitor')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')
// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req: any, res: any) {
	res.header('Content-Type', 'application/json');
	res.send(req.body);
});

var userId = constant.SYSTEM_USER_ID;

describe('api', function() {
    var con;
	beforeEach(function (done) {
		testdata.load(['test/default-data.yaml', 'test/api/monitor.yaml'], (err:any) => {
	        con = new db.Database();
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});
	describe('monitor', function() {
		var server = null;
		before((done) => {
			server = app.listen(3030).on('listening', done);
		});

		after(() => {
			server.close();
		});

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
				var monitorId = 603;
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: monitorId,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'NG'}, userId, {
					onSuccess: (result: any) => {
						var con = new db.Database();
						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [monitorId], (err, expectedResult) => {
							expect(err).to.be(null);
							expect(1).to.be(expectedResult.length);
							con.close();
							done();
						});
					}, 
					onFailure: (err: any) => {
						expect(err).to.be(null);
						done();
					},
				});
			});
			it('status change NG->OK', function(done) {
				var monitorId = 1001;
				monitor.modifyMonitorStatus({evidenceId: 1,
							     systemNodeId: monitorId,
							     timestamp:'2013-06-26T12:30:30.999Z',
							     comment:'Unit Test run',
							     status:'OK'}, userId, {
					onSuccess: (result: any) => {
						var con = new db.Database();
						con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [monitorId], (err, expectedResult) => {
							expect(err).to.be(null);
							expect(0).to.be(expectedResult.length);
							con.close();
							done();
						});
					}, 
					onFailure: (err: any) => {
						expect(err).to.be(null);
						done();
					},
				});
			});
		});
	});
});
