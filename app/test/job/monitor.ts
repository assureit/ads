///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import testdata = module('../testdata')
import db = module('../../db/db');
import model_monitor = module('../../model/monitor')

var expect = require('expect.js');      
var exec = require('child_process').exec
var dSvr = require('../server')

// describe('job', function() {
// 	var con = null;
// 	var server = null;
// 	var cmd = 'npm run-script clean_monitor';

// 	before((done) => {
// 		server = dSvr.app.listen(3030).on('listening', done);
// 	});
// 	after(() => {
// 		server.close();
// 		testdata.clear((err:any) => {});

// 	});

// 	beforeEach(function(done) {
// 		testdata.load(['test/default-data.yaml'], (err:any) => {
// 			con = new db.Database();
// 			dSvr.setRecRequestBody(null);
// 			dSvr.setResponseOK(true);
// 			done();
// 		});
// 	});

// //	afterEach(function (done) {
// //		console.log('AFTER EACH');
// //		testdata.clear((err:any) => done());
// //	});

// 	describe('monitor', function() {
// 		describe('cleanMonitor', function() {
// 			it('Run all skip', function(done) {
// 				testdata.load(['test/default-data.yaml'], (err:any) => {
// 					exec(cmd, function(err, stdout, stderr){
// 						expect(err).to.be(null);
// 						done();
// 					});
// 				});
// 			});
// 			it('DCase is already delete', function(done) {
// 				testdata.load(['test/job/monitor01.yaml'], (err:any) => {
// 					exec(cmd, function(err, stdout, stderr){
// 						expect(err).to.be(null);
// 						var monitor = new model_monitor.MonitorDAO(con);
// 						monitor.get(604, (err:any, resultMonitor:model_monitor.MonitorNode) => {
// 							expect(err).to.be(null);
// 							expect(resultMonitor.deleteFlag).to.be(true);
// 							expect(dSvr.getRecRequestBody()).not.to.be(null);
// 							expect(dSvr.getRecRequestBody().method).to.be('deleteMonitor');
// 							expect(dSvr.getRecRequestBody().params.nodeID).to.be(604);
// 							done();
// 						});
// 					});
// 				});
// 			});
// 			it('Not Found Lastest Commit', function(done) {
// 				testdata.load(['test/job/monitor02.yaml'], (err:any) => {
// 					exec(cmd, function(err, stdout, stderr){
// 						expect(err).to.be(null);
// 						var monitor = new model_monitor.MonitorDAO(con);
// 						monitor.get(605, (err:any, resultMonitor:model_monitor.MonitorNode) => {
// 							expect(err).to.be(null);
// 							expect(resultMonitor.deleteFlag).to.be(true);
// 							expect(dSvr.getRecRequestBody()).not.to.be(null);
// 							expect(dSvr.getRecRequestBody().method).to.be('deleteMonitor');
// 							expect(dSvr.getRecRequestBody().params.nodeID).to.be(605);
// 							done();
// 						});
// 					});
// 				});
// 			});
// 			it('Not Found Node', function(done) {
// 				testdata.load(['test/job/monitor03.yaml'], (err:any) => {
// 					exec(cmd, function(err, stdout, stderr){
// 						expect(err).to.be(null);
// 						var monitor = new model_monitor.MonitorDAO(con);
// 						monitor.get(606, (err:any, resultMonitor:model_monitor.MonitorNode) => {
// 							expect(err).to.be(null);
// 							expect(resultMonitor.deleteFlag).to.be(true);
// 							expect(dSvr.getRecRequestBody()).not.to.be(null);
// 							expect(dSvr.getRecRequestBody().method).to.be('deleteMonitor');
// 							expect(dSvr.getRecRequestBody().params.nodeID).to.be(606);
// 							done();
// 						});
// 					});
// 				});
// 			});
// 			it('Not Found MonitorNode', function(done) {
// 				testdata.clear((err:any) => {
// 					exec(cmd, function(err, stdout, stderr){
// 						expect(err).to.be(null);
// 						done();
// 					});
// 				});
// 			});
// 			it('Rec Response Error', function(done) {
// 				testdata.load(['test/job/monitor03.yaml'], (err:any) => {
// 					dSvr.setResponseOK(false);
// 					exec(cmd, function(err, stdout, stderr){
// 						expect(err).not.to.be(null);
// 						done();
// 					});
// 				});
// 			});
// 		});
// 	}) 
// })
