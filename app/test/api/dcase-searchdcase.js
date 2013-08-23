var assert = require('assert');
var db = require('../../db/db');
var dcase = require('../../api/dcase');

var constant = require('../../constant');
var testdata = require('../testdata');
var model_tag = require('../../model/tag');

var expect = require('expect.js');
var _ = require('underscore');

var userId = constant.SYSTEM_USER_ID;

describe('api', function () {
    var con;
    beforeEach(function (done) {
        testdata.load(['test/api/dcase-searchdcase.yaml'], function (err) {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('dcase', function () {
        describe('searchDCase', function () {
            it('should return result', function (done) {
                dcase.searchDCase(null, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result.dcaseList).not.to.be(null);
                        expect(result.dcaseList).to.be.an('array');
                        expect(result.dcaseList.length).greaterThan(0);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('dcaseList should be limited length', function (done) {
                dcase.searchDCase({ page: 1 }, userId, {
                    onSuccess: function (result) {
                        assert.equal(20, result.dcaseList.length);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('provides paging feature', function (done) {
                dcase.searchDCase({ page: 1 }, userId, {
                    onSuccess: function (result) {
                        expect(result.summary).not.to.be(undefined);
                        expect(result.summary.currentPage).not.to.be(undefined);
                        expect(result.summary.maxPage).not.to.be(undefined);
                        expect(result.summary.totalItems).not.to.be(undefined);
                        expect(result.summary.itemsPerPage).not.to.be(undefined);

                        con.query('SELECT count(d.id) as cnt FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE', function (err, expectedResult) {
                            if (err) {
                                con.close();
                                throw err;
                            }
                            expect(result.summary.totalItems).to.be(expectedResult[0].cnt);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('can return next page result', function (done) {
                dcase.searchDCase({ page: 1 }, userId, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({ page: 2 }, userId, {
                            onSuccess: function (result) {
                                assert.notEqual(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(JSON.stringify(error));
                                done();
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('allow page 0 as 1', function (done) {
                dcase.searchDCase({ page: 1 }, userId, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({ page: 0 }, userId, {
                            onSuccess: function (result) {
                                assert.equal(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(JSON.stringify(error));
                                done();
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('allow minus page as 1', function (done) {
                dcase.searchDCase({ page: 1 }, userId, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({ page: -1 }, userId, {
                            onSuccess: function (result) {
                                assert.equal(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(JSON.stringify(error));
                                done();
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('should start from offset 0', function (done) {
                var con = new db.Database();
                con.query('SELECT d.* FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified desc, c.id desc LIMIT 1', function (err, expectedResult) {
                    if (err) {
                        con.close();
                        throw err;
                    }
                    dcase.searchDCase({ page: 1 }, userId, {
                        onSuccess: function (result) {
                            assert.equal(result.dcaseList[0].dcaseId, expectedResult[0].id);
                            done();
                        },
                        onFailure: function (error) {
                            expect().fail(JSON.stringify(error));
                            done();
                        }
                    });
                });
            });

            var _assertHavingTags = function (tagList, dcaseId, callback) {
                con.query('SELECT t.* FROM tag t, dcase_tag_rel r WHERE r.tag_id = t.id AND r.dcase_id=?', [dcaseId], function (err, result) {
                    expect(err).to.be(null);
                    _.each(tagList, function (tag) {
                        var find = _.find(result, function (it) {
                            return it.label == tag;
                        });
                        expect(find).not.to.be(undefined);
                        expect(find).not.to.be(null);
                    });
                    callback(null);
                });
            };

            var _assertHavingTagsAll = function (tagList, dcaseIdList, callback) {
                if (dcaseIdList.length == 0) {
                    callback(null);
                    return;
                }
                _assertHavingTags(tagList, dcaseIdList[0], function (err) {
                    _assertHavingTagsAll(tagList, dcaseIdList.slice(1), callback);
                });
            };

            var _assertReadPermission = function (dcaseId, userId, callback) {
                con.query('SELECT count(d.id) as cnt FROM dcase d, project_has_user pu, project p WHERE d.project_id = p.id AND p.id = pu.project_id AND (p.public_flag = TRUE OR pu.user_id = ?) AND d.id = ?', [userId, dcaseId], function (err, result) {
                    expect(err).to.be(null);
                    expect(result[0].cnt).greaterThan(0);
                    callback(err);
                });
            };
            var _assertReadPermissionAll = function (dcaseIdList, userId, callback) {
                if (dcaseIdList.length == 0) {
                    callback(null);
                    return;
                }
                _assertReadPermission(dcaseIdList[0], userId, function (err) {
                    _assertReadPermissionAll(dcaseIdList.slice(1), userId, callback);
                });
            };

            it('should return public or project relative dcase', function (done) {
                dcase.searchDCase({}, userId, {
                    onSuccess: function (result) {
                        expect(result.dcaseList.length).greaterThan(0);
                        _assertReadPermissionAll(_.map(result.dcaseList, function (dcase) {
                            return dcase.dcaseId;
                        }), userId, function (err) {
                            expect(err).to.be(null);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });
            it('should return relative dcase if tagList is not empty', function (done) {
                var tags = ['tag1'];
                dcase.searchDCase({ tagList: tags, page: 1 }, userId, {
                    onSuccess: function (result) {
                        expect(result.dcaseList.length).greaterThan(0);
                        _assertHavingTagsAll(tags, _.map(result.dcaseList, function (dcase) {
                            return dcase.dcaseId;
                        }), function (err) {
                            expect(err).to.be(null);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('multi tagList should be AND query', function (done) {
                var tags = ['tag1', 'tag2'];
                dcase.searchDCase({ tagList: tags, page: 1 }, userId, {
                    onSuccess: function (result) {
                        expect(result.dcaseList.length).greaterThan(0);
                        _assertHavingTagsAll(tags, _.map(result.dcaseList, function (dcase) {
                            return dcase.dcaseId;
                        }), function (err) {
                            expect(err).to.be(null);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('tagList should be all tag list if argument tagList is empty', function (done) {
                dcase.searchDCase({ page: 1 }, userId, {
                    onSuccess: function (result) {
                        expect(result.tagList).not.to.be(null);
                        expect(result.tagList).to.be.an('array');
                        var tagDAO = new model_tag.TagDAO(con);
                        tagDAO.list(function (err, tagList) {
                            expect(result.tagList.length).to.equal(tagList.length);
                            var modelTagList = _.map(tagList, function (modelTag) {
                                return modelTag.label;
                            });
                            expect(_.difference(result.tagList, modelTagList)).to.be.empty();
                            expect(_.difference(modelTagList, result.tagList)).to.be.empty();
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });

            it('tagList should be filterd by search result dcase if argument tagList is not empty', function (done) {
                var tags = ['tag1', 'tag2'];
                dcase.searchDCase({ tagList: tags, page: 1 }, userId, {
                    onSuccess: function (result) {
                        expect(result.tagList).not.to.be(null);
                        expect(result.tagList).to.be.an('array');
                        _.each(result.tagList, function (tag) {
                            expect(tag).not.to.equal('deleted_tag');
                            expect(tag).not.to.equal('unlink_tag');
                            expect(tag).not.to.equal('unrelational_tag');
                        });
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });
        });
    });
});

