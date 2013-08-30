
var model_tag = require('../../model/tag');

var testdata = require('../testdata');
var expect = require('expect.js');
var async = require('async');

describe('model', function () {
    var testDB;
    var con;
    var tagDAO;
    var userId = 101;

    beforeEach(function (done) {
        testdata.begin(['test/default-data.yaml', 'test/model/tag.yaml'], function (err, c) {
            con = c;
            tagDAO = new model_tag.TagDAO(con);
            done();
        });
    });
    afterEach(function (done) {
        con.rollback(function (err, result) {
            con.close();
            if (err) {
                throw err;
            }
            done();
        });
    });
    describe('tag', function () {
        describe('list', function () {
            it('normal end', function (done) {
                tagDAO.list(function (err, list) {
                    expect(err).to.be(null);
                    expect(list).not.to.be(null);
                    done();
                });
            });
        });
        describe('search', function () {
            it('normal end', function (done) {
                tagDAO.search(userId, ['tag1', 'tag2'], function (err, list) {
                    expect(err).to.be(null);
                    expect(list).not.to.be(null);
                    done();
                });
            });
        });
        describe('insert', function () {
            it('normal end', function (done) {
                tagDAO.insert('test tag', function (err, tagId) {
                    expect(err).to.be(null);
                    expect(tagId).not.to.be(null);
                    con.query('SELECT * FROM tag WHERE id = ?', [tagId], function (err, resultTag) {
                        expect(err).to.be(null);
                        expect(resultTag).not.to.be(null);
                        expect(resultTag[0].label).to.eql('test tag');
                        done();
                    });
                });
            });
        });
        describe('listDCaseTag', function () {
            it('normal end', function (done) {
                tagDAO.listDCaseTag(201, function (err, list) {
                    expect(err).to.be(null);
                    expect(list).not.be(null);
                    done();
                });
            });
        });
        describe('replaceDCaseTag', function () {
            it('normal end tag3->deleted_tag', function (done) {
                tagDAO.replaceDCaseTag(201, ['tag1', 'tag2', 'deleted_tag'], function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM dcase_tag_rel WHERE dcase_id = 201 ORDER BY tag_id DESC', function (err, resultREL) {
                        expect(err).to.be(null);
                        expect(resultREL).not.to.be(null);
                        expect(resultREL.length).to.eql(3);
                        expect(resultREL[0].tag_id).to.eql(705);
                        done();
                    });
                });
            });
            it('normal end add new_tag', function (done) {
                tagDAO.replaceDCaseTag(201, ['tag1', 'tag2', 'deleted_tag', 'new_tag'], function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 201', function (err, resultREL) {
                        expect(err).to.be(null);
                        expect(resultREL).not.to.be(null);
                        expect(resultREL[0].cnt).to.eql(4);
                        con.query('SELECT COUNT(id) as cnt FROM tag WHERE label = "new_tag"', function (err, resultTAG) {
                            expect(err).to.be(null);
                            expect(resultTAG).not.to.be(null);
                            expect(resultTAG[0].cnt).to.eql(1);
                            done();
                        });
                    });
                });
            });
            it('tag clear', function (done) {
                tagDAO.replaceDCaseTag(201, [], function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 201', function (err, resultREL) {
                        expect(err).to.be(null);
                        expect(resultREL).not.to.be(null);
                        expect(resultREL[0].cnt).to.eql(0);
                        done();
                    });
                });
            });
        });
        describe('insertDCaseTagList', function () {
            it('normal end', function (done) {
                tagDAO.insertDCaseTagList(902, ['tag1', 'tag2'], function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 902', function (err, resultREL) {
                        expect(err).to.be(null);
                        expect(resultREL).not.to.be(null);
                        expect(resultREL[0].cnt).to.eql(2);
                        done();
                    });
                });
            });
            it('normal end add new_tag', function (done) {
                tagDAO.insertDCaseTagList(902, ['tag1', 'tag2', 'new_tag'], function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 902', function (err, resultREL) {
                        expect(err).to.be(null);
                        expect(resultREL).not.to.be(null);
                        expect(resultREL[0].cnt).to.eql(3);
                        con.query('SELECT COUNT(id) as cnt FROM tag WHERE label = "new_tag"', function (err, resultTAG) {
                            expect(err).to.be(null);
                            expect(resultTAG).not.to.be(null);
                            expect(resultTAG[0].cnt).to.eql(1);
                            done();
                        });
                    });
                });
            });
        });
        describe('removeDCaseTagList', function () {
            it('normal end', function (done) {
                var list = [];
                list.push(new model_tag.Tag(701, 'tag1', 0));
                list.push(new model_tag.Tag(702, 'tag2', 0));
                tagDAO.removeDCaseTagList(201, list, function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT COUNT(id) as cnt FROM dcase_tag_rel WHERE dcase_id = 201', function (err, resultREL) {
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

