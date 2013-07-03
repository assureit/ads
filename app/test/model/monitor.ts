///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>
///<reference path='../../DefinitelyTyped/async/async.d.ts'/>

import db = module('../../db/db')
import model_monitor = module('../../model/monitor')
import error = module('../../api/error')
var expect = require('expect.js');	// TODO: import module化
var async = require('async');


describe('model', function() {
	describe('monitor', function() {
		var con: db.Database
		var monitorDAO: model_monitor.MonitorDAO;
		beforeEach((done) => {
			con = new db.Database();
			con.begin((err, result) => {
				monitorDAO = new model_monitor.MonitorDAO(con);
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
						con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params) VALUES (?, ?, ?, ?, ?)', 
							[40, 1, 10, 100, JSON.stringify({a: 'val_a', b: 2})], 
							(err:any, result:any) => {
								if (!err) notPublishedList.push(result.insertId);
								next(err);
							});
					}
					, (next) => {
						con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params, publish_status) VALUES (?, ?, ?, ?, ?, ?)', 
							[40, 2, 20, 200, null, 2], 
							(err:any, result:any) => {
								if (!err) notPublishedList.push(result.insertId);
								next(err);
							});
					}
					, (next) => {
						con.query('INSERT INTO monitor_node(dcase_id, this_node_id, watch_id, preset_id, params, publish_status) VALUES (?, ?, ?, ?, ?, ?)', 
							[40, 3, 30, 300, null, 1], 
							(err:any, result:any) => {
								if (!err) published = result.insertId;
								next(err);
							});
					}
					, (next) => {
						console.log('3');
						monitorDAO.listNotPublished(40, (err:any, list:model_monitor.MonitorNode[]) => {
							expect(list).not.to.be(null);
							expect(list.length > 0).to.equal(true);
							console.log(list);
							var tested = 0;
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
	});
});
