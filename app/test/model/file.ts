///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_file = module('../../model/file')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化

describe('model', function() {
	var testDB;
	var con: db.Database
	var fileDAO: model_file.FileDAO;

	beforeEach(function (done) {
		testdata.begin(['test/default-data.yaml'], (err:any, c:db.Database) => {
			con = c;
			fileDAO = new model_file.FileDAO(con);
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
	describe('file', function() {
		describe('insert', function() {
			it('normal end', function(done) {
				fileDAO.insert('filename', 1, (err: any, fileId: number) => {
					expect(err).to.be(null);
					expect(fileId).not.to.be(null);
					con.query('SELECT * FROM file WHERE id=?', [fileId], (err, result) => {
						expect(err).to.be(null);
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result[0].id).to.be(fileId);
						expect(result[0].name).to.eql('filename');
						expect(result[0].user_id).to.eql(1);
						done();
					});
				});
			});
			it('user id is not exist', function(done) {
				fileDAO.insert('filename', 99999, (err:any, fileId:number) => {
					expect(err).not.to.be(null);
					done();
				});
			});
		});
		describe('update', function() {
			it('normal end', function(done) {
				fileDAO.update(301, 'update test', (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM file WHERE id=301', (err, result) => {
						expect(err).to.be(null);
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result[0].path).to.eql('update test');
						done();
					});
				});
			});	
		});
		describe('select', function() {
			it('normal end', function(done) {
				fileDAO.select(301, (err:any, path:string, name:string) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM file WHERE id=301', (err, result) => {
						expect(err).to.be(null);
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(result[0].path).to.eql(path);
						expect(result[0].name).to.eql(name);
						done();
					});
				});
			});
		});
		describe('get', function() {
			it('normal end', function(done) {
				fileDAO.get(301, (err:any, file:model_file.File) => {
					expect(err).to.be(null);
					expect(file).not.to.be(null);
					expect(file).not.to.be(undefined);
					con.query('SELECT * FROM file WHERE id=301', (err, result) => {
						expect(err).to.be(null);
						expect(result).not.to.be(null);
						expect(result).not.to.be(undefined);
						expect(file.id).to.eql(result[0].id);
						expect(file.name).to.eql(result[0].name);
						expect(file.path).to.eql(result[0].path);
						expect(file.userId).to.eql(result[0].user_id);	
						done();
					});
				});
			});
		});
	});
});
