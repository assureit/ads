///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_dcase = module('../../model/dcase')
import model_pager = module('../../model/pager')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')

describe('model', function() {
	var testDB;
	var con: db.Database
	var dcaseDAO: model_dcase.DCaseDAO;
	var userId:number = 2;

	beforeEach(function (done) {
		testdata.begin(['test/model/dcase.yaml'], (err:any, c:db.Database) => {
			con = c;
			dcaseDAO = new model_dcase.DCaseDAO(con);
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
	describe('dcase', function() {
		describe('get', function() {
			it('normal end', function(done) {
				dcaseDAO.get(201, (err: any, result:model_dcase.DCase) => {
					expect(err).to.be(null);
					expect(result).not.to.be(null);
					con.query('SELECT * FROM dcase WHERE id=201', (err, resultDCase) => {
						expect(err).to.be(null);
						expect(result.id).to.eql(resultDCase[0].id);
						expect(result.name).to.eql(resultDCase[0].name);
						expect(result.userId).to.eql(resultDCase[0].user_id);
						expect(result.deleteFlag).to.eql(resultDCase[0].delete_flag);
						done();
					});
				});
			});
		});
		describe('insert', function() {
			it('normal end', function(done) {
				var params = {
						userId:1,
						dcaseName:'insert test'
					};

				dcaseDAO.insert(params, (err:any, dcaseId:number) => {
					expect(err).to.be(null);
					expect(dcaseId).not.to.be(null);
					con.query('SELECT * FROM dcase WHERE id=?', [dcaseId], (err:any, result) => {
						expect(err).to.be(null);
						expect(dcaseId).to.eql(result[0].id);
						expect(params.userId).to.eql(result[0].user_id);
						expect(params.dcaseName).to.eql(result[0].name);	
						done();
					});
				});
			});
			it('user id is not exists', function(done) {
				var params = {
						userId:999,
						dcaseName:'failure!'
					};
				dcaseDAO.insert(params, (err:any, dcaseId:number) => {
					expect(err).not.to.be(null);
					done();
				});
			});
		});
		describe('list', function() {
			it('normal end no tag', function(done) {
				dcaseDAO.list(1, userId, null, null, (err:any, pager: model_pager.Pager, result: model_dcase.DCase[]) => {
					expect(err).to.be(null);
					expect(pager).not.to.be(null);
					expect(pager).not.to.be(undefined);
					expect(pager.totalItems).not.to.be(null);
					expect(pager.totalItems).not.to.be(undefined);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.length).greaterThan(0);
					expect(result[0].user).not.to.be(null);
					expect(result[0].user).not.to.be(undefined);
					expect(result[0].latestCommit).not.to.be(null);
					expect(result[0].latestCommit).not.to.be(undefined);
					done();
				}); 
			});
			it('normal end plus tag', function(done) {
				dcaseDAO.list(1, userId, null, ["tag1"], (err:any, pager: model_pager.Pager, result: model_dcase.DCase[]) => {
					expect(err).to.be(null);
					expect(pager).not.to.be(null);
					expect(pager).not.to.be(undefined);
					expect(pager.totalItems).not.to.be(null);
					expect(pager.totalItems).not.to.be(undefined);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.length).greaterThan(0);
					expect(result[0].user).not.to.be(null);
					expect(result[0].user).not.to.be(undefined);
					expect(result[0].latestCommit).not.to.be(null);
					expect(result[0].latestCommit).not.to.be(undefined);
					done();
				}); 
			});
			it('tag is not exists', function(done) {
				dcaseDAO.list(1, userId, null, ["QQQ"], (err:any, pager: model_pager.Pager, result: model_dcase.DCase[]) => {
					expect(err).to.be(null);
					expect(pager).not.to.be(null);
					expect(pager).not.to.be(undefined);
					expect(pager.totalItems).not.to.be(null);
					expect(pager.totalItems).not.to.be(undefined);
					expect(result).not.to.be(null);
					expect(result).not.to.be(undefined);
					expect(result.length).to.be(0);
					done();
				}); 
			});
		});
		describe('remove', function() {
			it('normal end', function(done) {
				dcaseDAO.remove(201, (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM dcase WHERE id=201', (err:any, result) => {
						expect(err).to.be(null);
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result[0].delete_flag).to.eql(true);	
						done();
					});
				});
			});	
		});
		describe('update', function() {
			it('normal end', function(done) {
				dcaseDAO.update(201, 'update test', (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM dcase WHERE id=201', (err:any, result) => {
						expect(err).to.be(null);
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result[0].name).to.eql('update test');	
						done();
					});
				});
			});
		});
	});
});
