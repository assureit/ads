///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_issue = module('../../model/issue')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')
var CONFIG = require('config')
var dSvr = require('../server')

// describe('model', function() {
// 	var testDB;
// 	var con: db.Database
// 	var issueDAO: model_issue.IssueDAO;
// 	var server = null;

// 	before((done) => {
// 		CONFIG.redmine.port = 3030;
// 		server = dSvr.app.listen(3030).on('listening', done);
// 	});
// 	after(() => {
// 		server.close();
// 		CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
// 		CONFIG.resetRuntime((err, written, buffer) => {});
// 	});

// 	beforeEach(function (done) {
// 		testdata.begin(['test/default-data.yaml', 'test/model/issue.yaml'], (err:any, c:db.Database) => {
// 			con = c;
// 			issueDAO = new model_issue.IssueDAO(con);
// 			dSvr.setRedmineRequestBody(null);
// 			done();
// 		});
// 	});
// 	afterEach(function (done) {
// 		con.rollback(function (err, result) {
// 			con.close();
// 			if(err) {
// 				throw err;
// 			}
// 			done();
// 		});
// 	});
// 	describe('issue', function() {
// 		describe('insert', function() {
// 			it('normal end', function(done) {
// 				var params = new model_issue.Issue(null, 201, null, 'test issue subject', 'test issue description');
// 				issueDAO.insert(params, (err: any, result:model_issue.Issue) => {
// 					expect(err).to.be(null);
// 					expect(result).not.to.be(null);
// 					con.query('SELECT * FROM issue WHERE id=?', [result.id], (err, resultIssue) => {
// 						expect(err).to.be(null);
// 						expect(resultIssue).not.to.be(null);
// 						expect(result.id).to.be(resultIssue[0].id);
// 						expect(result.dcaseId).to.be(resultIssue[0].dcase_id);
// 						expect(result.subject).to.be(resultIssue[0].subject);
// 						expect(result.description).to.be(resultIssue[0].description);
// 						done();
// 					});
// 				});
// 			});
// 			it('dcaseId is not exists', function(done) {
// 				var params = new model_issue.Issue(null, 999, null, 'test issue subject', 'test issue description');
// 				issueDAO.insert(params, (err: any, result:model_issue.Issue) => {
// 					expect(err).not.to.be(null);
// 					done();
// 				});
// 			});
// 		});
// 		describe('update', function() {
// 			it('normal end', function(done) {
// 				var params = new model_issue.Issue(2001, 201, 'test issuei its_id', 'test issue subject', 'test issue description');
// 				issueDAO.updatePublished(params, (err: any, result:model_issue.Issue) => {
// 					expect(err).to.be(null);
// 					expect(result).not.to.be(null);
// 					con.query('SELECT * FROM issue WHERE id=2001', (err, resultIssue) => {
// 						expect(err).to.be(null);
// 						expect(resultIssue).not.to.be(null);
// 						expect(result.itsId).to.be(resultIssue[0].its_id);
// 						done();
// 					});
// 				});
// 			});
// 		});
// 		describe('listNotPublished', function() {
// 			it('normal end', function(done) {
// 				issueDAO.listNotPublished(201, (err:any, list:model_issue.Issue[]) => {
// 					expect(err).to.be(null);
// 					expect(list).not.to.be(null);
// 					expect(list.length).to.eql(2);
// 					done();
// 				});
// 			});
// 		});
// 		describe('publish', function() {
// 			it('normal end', function(done) {
// 				issueDAO.publish(201, (err:any) => {
// 					expect(err).to.be(null);
// 					con.query('SELECT * FROM issue WHERE dcase_id=201 AND its_id is null', (err, resultIssue) => {
// 						expect(err).to.be(null);	
// 						expect(resultIssue).not.to.be(null);
// 						expect(resultIssue.length).to.eql(0);
// 						done();
// 					});
// 				});
// 			});
// 			it('redmine parameter check', function(done) {
// 				issueDAO.publish(202, (err:any) => {
// 					expect(err).to.be(null);
// 					expect(dSvr.getRedmineRequestBody()).not.to.be(null);
// 					expect(dSvr.getRedmineRequestBody().issue.subject).to.eql('test data04');
// 					expect(dSvr.getRedmineRequestBody().issue.description).to.eql('test description04');
// 					con.query('SELECT * FROM issue WHERE dcase_id=202 AND its_id is null', (err, resultIssue) => {
// 						expect(err).to.be(null);	
// 						expect(resultIssue).not.to.be(null);
// 						expect(resultIssue.length).to.eql(0);
// 						done();
// 					});
// 				});
// 			});
// 		});
// 	});
// });
