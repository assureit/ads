///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_tag = module('../../model/tag')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')

describe('model', function() {
	var testDB;
	var con: db.Database
	var tagDAO: model_tag.TagDAO;
	var userId:number = 101;

	beforeEach(function (done) {
		testdata.begin(['test/default-data.yaml', 'test/model/tag.yaml'], (err:any, c:db.Database) => {
			con = c;
			tagDAO = new model_tag.TagDAO(con);
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
	describe('tag', function() {
		describe('list', function() {
			it('normal end', function(done) {
				tagDAO.list((err: any, list:model_tag.Tag[]) => {
					expect(err).to.be(null);
					expect(list).not.to.be(null);
					done();
				});
			});
		});
		describe('search', function() {
			it('normal end', function(done) {
				tagDAO.search(userId, ['tag1', 'tag2'], (err:any, list:model_tag.Tag[]) => {
					expect(err).to.be(null);
					expect(list).not.to.be(null);
					done();
				});
			});
		});
		describe('insert', function() {
			it('normal end', function(done) {
				tagDAO.insert('test tag', (err:any, tagId:number) => {
					expect(err).to.be(null);
					expect(tagId).not.to.be(null);
					con.query('SELECT * FROM tag WHERE id = ?', [tagId], (err:any, resultTag:any) => {
						expect(err).to.be(null);
						expect(resultTag).not.to.be(null);
						expect(resultTag[0].label).to.eql('test tag');
						done();
					});
				});
			});
		});
		describe('listDCaseTag', function() {
			it('normal end', function(done) {
				tagDAO.listDCaseTag(201, (err:any, list:model_tag.Tag[]) => {
					expect(err).to.be(null);
					expect(list).not.be(null);
					done();
				});
			});
		});
		describe('replaceDCaseTag', function() {
			it('normal end tag3->deleted_tag', function(done) {
				tagDAO.replaceDCaseTag(201, ['tag1', 'tag2', 'deleted_tag'], (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM dcase_tag_rel WHERE dcase_id = 201 ORDER BY tag_id DESC', (err:any, resultREL:any) => {
						expect(err).to.be(null);
						expect(resultREL).not.to.be(null);
						expect(resultREL.length).to.eql(3);
						expect(resultREL[0].tag_id).to.eql(705);
						done();
					});
				});
			});
			it('normal end add new_tag', function(done) {
				tagDAO.replaceDCaseTag(201, ['tag1', 'tag2', 'deleted_tag', 'new_tag'], (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 201', (err:any, resultREL:any) => {
						expect(err).to.be(null);
						expect(resultREL).not.to.be(null);
						expect(resultREL[0].cnt).to.eql(4);
						con.query('SELECT COUNT(id) as cnt FROM tag WHERE label = "new_tag"', (err:any, resultTAG:any) => {
							expect(err).to.be(null);
							expect(resultTAG).not.to.be(null);
							expect(resultTAG[0].cnt).to.eql(1);
							done();
						});
					});
				});
			});
			it('tag clear', function(done) {
				tagDAO.replaceDCaseTag(201, [], (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 201', (err:any, resultREL:any) => {
						expect(err).to.be(null);
						expect(resultREL).not.to.be(null);
						expect(resultREL[0].cnt).to.eql(0);
						done();
					});
				});
			});
		});
		describe('insertDCaseTagList', function() {
			it('normal end', function(done) {
				tagDAO.insertDCaseTagList(902, ['tag1', 'tag2'], (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 902', (err:any, resultREL:any) => {
						expect(err).to.be(null);
						expect(resultREL).not.to.be(null);
						expect(resultREL[0].cnt).to.eql(2);
						done();
					});
				});
			});
			it('normal end add new_tag', function(done) {
				tagDAO.insertDCaseTagList(902, ['tag1', 'tag2', 'new_tag'], (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 902', (err:any, resultREL:any) => {
						expect(err).to.be(null);
						expect(resultREL).not.to.be(null);
						expect(resultREL[0].cnt).to.eql(3);
						con.query('SELECT COUNT(id) as cnt FROM tag WHERE label = "new_tag"', (err:any, resultTAG:any) => {
							expect(err).to.be(null);
							expect(resultTAG).not.to.be(null);
							expect(resultTAG[0].cnt).to.eql(1);
							done();
						});
					});
				});
			});
		});
		describe('removeDCaseTagList', function() {
			it('normal end', function(done) {
				var list:model_tag.Tag[] = [];
				list.push(new model_tag.Tag(701, 'tag1', 0));
				list.push(new model_tag.Tag(702, 'tag2', 0));
				tagDAO.removeDCaseTagList(201, list, (err:any) => {
					expect(err).to.be(null);
					con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 201', (err:any, resultREL:any) => {
						expect(err).to.be(null);
						expect(resultREL).not.to.be(null);
						expect(resultREL[0].cnt).to.eql(1);
						done();
					});
				});
			});
		});
	});
});
