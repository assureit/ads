///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_commit = module('../../model/commit')
import model_node = module('../../model/node')
import model_monitor = module('../../model/monitor')
import model_issue = module('../../model/issue')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')
var CONFIG = require('config')
var dSvr = require('../server')

describe('model', function() {
	var testDB;
	var con: db.Database
	var commitDAO: model_commit.CommitDAO;
	var validParam:any;

	var server = null;
	before((done) => {
		CONFIG.redmine.port = 3030;
		server = dSvr.app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
		CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
		CONFIG.resetRuntime((err, written, buffer) => {});
	});

	beforeEach(function (done) {
		validParam = {
			commitId: 401,
			commitMessage: 'test',
			contents: '*goal\n' +
						'dcase1\n' +
						'Note0::\n' +
						'	Type: Issue\n' +
						'	Subject: このゴールを満たす必要がある\n' +
						'	Visible: true\n' +
						'	詳細な情報をここに記述する\n' +
						'Note1::\n' +
						'	Type: LastUpdated\n' +
						'	User: Shida\n' +
						'	Visible: false\n' +
						'Note2::\n' +
						'	Type: Tag\n' +
						'	Tag: tag1\n' +
						'	Visible: true\n' +
						'*strategy\n' +
						's1\n' +
						'**goal\n' +
						'g1\n' +
						'Note0::\n' +
						'	Type: Issue\n' +
						'	Subject: 2つ目のイシュー\n' +
						'	Visible: true\n' +
						'	あああ詳細な情報をここに記述する\n' +
						'Note1::\n' +
						'	Type: LastUpdated\n' +
						'	User: Shida\n' +
						'	Visible: false\n' +
						'Note2::\n' +
						'	Type: Tag\n' +
						'	Tag: tag1\n' +
						'	Visible: true\n' +
						'Note3::\n' +
						'	Type: Tag\n' +
						'	Tag: tag2\n' +
						'	Visible: true\n' +
						'Note4::\n' +
						'	Type: Tag\n' +
						'	Tag: newTag\n' +
						'	Visible: true'
		};

		testdata.begin(['test/default-data.yaml', 'test/model/commit.yaml'], (err:any, c:db.Database) => {
			con = c;
			commitDAO = new model_commit.CommitDAO(con);
			dSvr.setResponseOK(true);
			dSvr.setRedmineRequestBody(null);
			dSvr.setRecRequestBody(null);
			done();
		});
	});
	afterEach(function (done) {
		con.rollback(function (err, result) {
			con.close();
			if(err) {
				throw err;
			}
			done();
		});
	});
	describe('commit', function() {
		describe('insert', function() {
			it('normal end', function(done) {
				var params = {	data: JSON.stringify(validParam.contents),
						prevId: 401,
						dcaseId: 201,
						userId: 1,
						message: validParam.commitMessage
					};
				commitDAO.insert(params, (err: any, commitId: number) => {
					expect(err).to.be(null);
					expect(commitId).not.to.be(null);
					con.query('SELECT * FROM commit WHERE id=?', [commitId], (err, result) => {
						expect(err).to.be(null);
						expect(result[0].id).to.be(commitId);

						con.query('SELECT * FROM commit WHERE id = 401', (err, result) => {
							expect(err).to.be(null);
							expect(result[0].latest_flag).to.eql(false);
							done();
						});
					});
				});
			});
			it('dcase id is not exists ', function(done) {
				var params = {	data: JSON.stringify(validParam.contents),
						prevId: 401,
						dcaseId: 999,
						userId: 1,
						message: validParam.commitMessage
					};
				commitDAO.insert(params, (err: any, commitId: number) => {
					expect(err).not.to.be(null);
					done();
				});
			});
		});
		describe('update', function() {
			it('normal end', function(done) {
				commitDAO.update(401, 'update test', (err: any) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM commit WHERE id=401', (err, result) => {
						expect(err).to.be(null);				
						expect(result[0].data).to.eql('update test');
						done();
					});
				});
			});
		});
		describe('_clearLastUpdateFlag', function() {
			it('normal end', function(done) {
				commitDAO._clearLastUpdateFlag(201, 999, (err) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM commit WHERE dcase_id=201', (err, result) => {
						expect(err).to.be(null);
						expect(result[0].latest_flag).to.eql(false);
						done();
					});	
				});
			});
		});
		describe('get', function() {
			it('normal end', function(done) {
				commitDAO.get(401, (err: any, result:model_commit.Commit) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					con.query('SELECT * FROM commit WHERE id=401', (err, resultEx) => {
						expect(err).to.be(null);
						expect(result.id).to.eql(resultEx[0].id);
						expect(result.prevCommitId).to.eql(resultEx[0].prev_commit_id);
						expect(result.dcaseId).to.eql(resultEx[0].dcase_id);
						expect(result.userId).to.eql(resultEx[0].user_id);
						expect(result.message).to.eql(resultEx[0].message);
						expect(result.data).to.eql(resultEx[0].data);
						expect(result.dateTime).to.eql(resultEx[0].date_time);
						expect(result.latestFlag).to.eql(resultEx[0].latest_flag);
						done();
					});
				});
			});
		});
		describe('list', function() {
			it('normal end', function(done) {
				commitDAO.list(201, (err:any, list: model_commit.Commit[]) => {
					expect(err).to.be(null);
					expect(list).not.to.be(null);
					expect(list).not.to.be(undefined);
					con.query('SELECT * FROM commit WHERE dcase_id=201 ORDER BY id', (err, result) => {
						expect(err).to.be(null);
						expect(list.length).to.eql(result.length);
						expect(list[0].id).to.eql(result[0].id);
						expect(list[0].prevCommitId).to.eql(result[0].prev_commit_id);
						expect(list[0].dcaseId).to.eql(result[0].dcase_id);
						expect(list[0].userId).to.eql(result[0].user_id);
						expect(list[0].message).to.eql(result[0].message);
						expect(list[0].data).to.eql(result[0].data);
						expect(list[0].dateTime).to.eql(result[0].date_time);
						expect(list[0].latestFlag).to.eql(result[0].latest_flag);
						done();
					});
				});
			});
		});
		describe('commit', function() {
			it('normal end', function(done) {
				this.timeout(15000);
				commitDAO.commit(1, 401, 'commit test', validParam.contents, (err, result) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.commitId).not.to.be(null);
					expect(result.commitId).not.to.be(undefined);
					con.query('SELECT * FROM commit WHERE id=?', [result.commitId], (err, resultCommit) => {
						expect(err).to.be(null);
						expect(resultCommit[0].latest_flag).to.eql(true);	
						done();
					});
				});
			});
			// it('redmine parameter check ', function(done) {
			// 	this.timeout(15000);
			// 	validParam.contents.NodeList[2].MetaData = [];
			// 	commitDAO.commit(1, 401, 'commit test', validParam.contents, (err, result) => {
			// 		expect(err).to.be(null);
			// 		expect(result).not.to.be(null);
			// 		expect(result).not.to.be(undefined);
			// 		expect(result.commitId).not.to.be(null);
			// 		expect(result.commitId).not.to.be(undefined);
			// 		expect(dSvr.getRedmineRequestBody()).not.to.be(null);
			// 		expect(dSvr.getRedmineRequestBody().issue.subject).to.eql(validParam.contents.NodeList[0].MetaData[0].Subject);
			// 		expect(dSvr.getRedmineRequestBody().issue.description).to.eql(validParam.contents.NodeList[0].MetaData[0].Description);
			// 		con.query('SELECT * FROM commit WHERE id=?', [result.commitId], (err, resultCommit) => {
			// 			expect(err).to.be(null);
			// 			expect(resultCommit[0].latest_flag).to.eql(true);
			// 			expect
			// 			done();
			// 		});
			// 	});
			// });
			// it('rec api registMonitor parameter check', function(done) {
			// 	this.timeout(15000);
			// 	commitDAO.commit(1, 406, 'commit test', validParam.contents, (err, result) => {
			// 		expect(err).to.be(null);
			// 		expect(result).not.to.be(null);
			// 		expect(result).not.to.be(undefined);
			// 		expect(result.commitId).not.to.be(null);
			// 		expect(result.commitId).not.to.be(undefined);
			// 		con.query('SELECT * FROM commit WHERE id=?', [result.commitId], (err, resultCommit) => {
			// 			expect(err).to.be(null);
			// 			expect(resultCommit[0].latest_flag).to.eql(true);
			// 			con.query('SELECT * FROM monitor_node WHERE dcase_id = ?', [resultCommit[0].dcase_id], (errMonitor:any, resultMonitor:any) => {
			// 				expect(errMonitor).to.be(null);
			// 				expect(resultMonitor).not.to.be(null);
			// 				expect(resultMonitor.length).to.eql(1);
			// 				expect(dSvr.getRecRequestBody).not.to.be(null);
			// 				expect(dSvr.getRecRequestBody().method).to.eql('registMonitor');
			// 				expect(dSvr.getRecRequestBody().params.nodeID).to.eql(resultMonitor[0].id);
			// 				expect(dSvr.getRecRequestBody().params.watchID).to.eql(resultMonitor[0].watch_id);
			// 				expect(dSvr.getRecRequestBody().params.presetID).to.eql(resultMonitor[0].preset_id);
			// 				done();
			// 			});
			// 		});
			// 	});
			// });
			// it('rec api updateMonitor parameter check', function(done) {
			// 	this.timeout(15000);
			// 	commitDAO.commit(1, 407, 'commit test', validParam.contents, (err, result) => {
			// 		expect(err).to.be(null);
			// 		expect(result).not.to.be(null);
			// 		expect(result).not.to.be(undefined);
			// 		expect(result.commitId).not.to.be(null);
			// 		expect(result.commitId).not.to.be(undefined);
			// 		con.query('SELECT * FROM commit WHERE id=?', [result.commitId], (err, resultCommit) => {
			// 			expect(err).to.be(null);
			// 			expect(resultCommit[0].latest_flag).to.eql(true);	
			// 			con.query('SELECT * FROM monitor_node WHERE dcase_id = ?', [resultCommit[0].dcase_id], (errMonitor:any, resultMonitor:any) => {
			// 				expect(errMonitor).to.be(null);
			// 				expect(resultMonitor).not.to.be(null);
			// 				expect(resultMonitor.length).to.eql(1);
			// 				expect(dSvr.getRecRequestBody()).not.to.be(null);
			// 				expect(dSvr.getRecRequestBody().method).to.eql('updateMonitor');
			// 				expect(dSvr.getRecRequestBody().params.nodeID).to.eql(resultMonitor[0].id);
			// 				expect(dSvr.getRecRequestBody().params.watchID).to.eql(resultMonitor[0].watch_id);
			// 				expect(dSvr.getRecRequestBody().params.presetID).to.eql(resultMonitor[0].preset_id);
			// 				done();
			// 			});
			// 		});
			// 	});
			// });
		});
	});
});
