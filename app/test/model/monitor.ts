///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>
///<reference path='../../DefinitelyTyped/async/async.d.ts'/>

import db = module('../../db/db')
import model_monitor = module('../../model/monitor')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async');
var dSvr = require('../server')

describe('model', function() {
	describe('monitor', function() {
		var server = null;
		before((done) => {
			server = dSvr.app.listen(3030).on('listening', done);
		});

		after(() => {
			server.close();
		});

		var con: db.Database
		var monitorDAO: model_monitor.MonitorDAO;
		beforeEach((done) => {
			testdata.begin(['test/default-data.yaml', 'test/model/monitor.yaml'], (err:any, c:db.Database) => {
				con = c;
				monitorDAO = new model_monitor.MonitorDAO(con);
				dSvr.getRecRequestBody(null);
				done();
			});
		});

		afterEach((done) => {
			if (con) {
				con.rollback((err, result) => {
					con.close();
					if (err) {
						throw err;
					}
					done();
				});
			}
		});

		describe('listNotPublish', function() {
			it('should not select publish_status 1', function(done) {
				var notPublishedList = [];
				var published = 0;
				async.waterfall([
					(next) => {
						monitorDAO.listNotPublished(201, (err:any, list:model_monitor.MonitorNode[]) => {
							expect(list).not.to.be(null);
							expect(list.length > 0).to.equal(true);
							list.forEach((it) => {
								expect(it.id).not.to.equal(published);
							});
							next(err);
						});
					}
				], (err:any, result:any) => {
					expect(err).to.be(null);
					done();
				});
			});
		});

		describe('publish', function() {
			it('should update publish_status to 1', function(done) {
				async.waterfall([
					(next) => {
						monitorDAO.publish(201, (err:any) => {
							next(err);
						});
					}
					, (next) => {
						monitorDAO.listNotPublished(201, (err:any, list:model_monitor.MonitorNode[]) => {
							expect(list).not.to.be(null);
							expect(list.length).to.equal(0);
							next(err);
						});
					}
				], (err:any, result:any) => {
					expect(err).to.be(null);
					done();
				});
			});
			it('rec api registMonitor parameter check', function(done) {
				async.waterfall([
					(next) => {
						monitorDAO.publish(202, (err:any) => {
							next(err);
						});
					}
					, (next) => {
						monitorDAO.listNotPublished(202, (err:any, list:model_monitor.MonitorNode[]) => {
							expect(list).not.to.be(null);
							expect(list.length).to.equal(0);
							next(err);
						});
					}
					, (next) => {
						con.query('SELECT * FROM monitor_node WHERE dcase_id = 202', (err:any, resultMonitor:any) => {
							expect(err).to.be(null);
							expect(resultMonitor).not.to.be(null);
							expect(resultMonitor.length).to.eql(1);
							expect(dSvr.getRecRequestBody()).not.to.be(null);
							expect(dSvr.getRecRequestBody().method).to.eql('registMonitor');
							expect(dSvr.getRecRequestBody().params.nodeID).to.eql(resultMonitor[0].id);
							expect(dSvr.getRecRequestBody().params.watchID).to.eql(resultMonitor[0].watch_id);
							expect(dSvr.getRecRequestBody().params.presetID).to.eql(resultMonitor[0].preset_id);
							next(err);	
						});
					}
				], (err:any, result:any) => {
					expect(err).to.be(null);
					done();
				});
			});
			it('rec api updateMonitor parameter check', function(done) {
				async.waterfall([
					(next) => {
						monitorDAO.publish(203, (err:any) => {
							next(err);
						});
					}
					, (next) => {
						monitorDAO.listNotPublished(203, (err:any, list:model_monitor.MonitorNode[]) => {
							expect(list).not.to.be(null);
							expect(list.length).to.equal(0);
							next(err);
						});
					}
					, (next) => {
						con.query('SELECT * FROM monitor_node WHERE dcase_id = 203', (err:any, resultMonitor:any) => {
							expect(err).to.be(null);
							expect(resultMonitor).not.to.be(null);
							expect(resultMonitor.length).to.eql(1);
							expect(dSvr.getRecRequestBody()).not.to.be(null);
							expect(dSvr.getRecRequestBody().method).to.eql('updateMonitor');
							expect(dSvr.getRecRequestBody().params.nodeID).to.eql(resultMonitor[0].id);
							expect(dSvr.getRecRequestBody().params.watchID).to.eql(resultMonitor[0].watch_id);
							expect(dSvr.getRecRequestBody().params.presetID).to.eql(resultMonitor[0].preset_id);
							next(err);	
						});
					}
				], (err:any, result:any) => {
					expect(err).to.be(null);
					done();
				});
			});
		});
	});
});
