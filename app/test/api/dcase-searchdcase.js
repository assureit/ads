var assert = require('assert')
var db = require('../../db/db')
var dcase = require('../../api/dcase')

var constant = require('../../constant')
var testdata = require('../testdata')
var expect = require('expect.js');
var userId = constant.SYSTEM_USER_ID;
describe('api', function () {
    var con;
    beforeEach(function (done) {
        testdata.load([
            'test/api/dcase.yaml'
        ], function (err) {
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
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('dcaseList should be limited length', function (done) {
                dcase.searchDCase({
                    page: 1
                }, userId, {
                    onSuccess: function (result) {
                        assert.equal(20, result.dcaseList.length);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('provides paging feature', function (done) {
                dcase.searchDCase({
                    page: 1
                }, userId, {
                    onSuccess: function (result) {
                        expect(result.summary).not.to.be(undefined);
                        expect(result.summary.currentPage).not.to.be(undefined);
                        expect(result.summary.maxPage).not.to.be(undefined);
                        expect(result.summary.totalItems).not.to.be(undefined);
                        expect(result.summary.itemsPerPage).not.to.be(undefined);
                        con.query('SELECT count(d.id) as cnt FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE', function (err, expectedResult) {
                            if(err) {
                                con.close();
                                throw err;
                            }
                            expect(result.summary.totalItems).to.be(expectedResult[0].cnt);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('can return next page result', function (done) {
                dcase.searchDCase({
                    page: 1
                }, userId, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({
                            page: 2
                        }, userId, {
                            onSuccess: function (result) {
                                assert.notEqual(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(JSON.stringify(error));
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('allow page 0 as 1', function (done) {
                dcase.searchDCase({
                    page: 1
                }, userId, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({
                            page: 0
                        }, userId, {
                            onSuccess: function (result) {
                                assert.equal(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(JSON.stringify(error));
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('allow minus page as 1', function (done) {
                dcase.searchDCase({
                    page: 1
                }, userId, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({
                            page: -1
                        }, userId, {
                            onSuccess: function (result) {
                                assert.equal(result1st.dcaseList[0].dcaseId, result.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(JSON.stringify(error));
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('should start from offset 0', function (done) {
                var con = new db.Database();
                con.query('SELECT d.* FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified, c.id desc LIMIT 1', function (err, expectedResult) {
                    if(err) {
                        con.close();
                        throw err;
                    }
                    dcase.searchDCase({
                        page: 1
                    }, userId, {
                        onSuccess: function (result) {
                            assert.equal(result.dcaseList[0].dcaseId, expectedResult[0].id);
                            done();
                        },
                        onFailure: function (error) {
                            expect().fail(JSON.stringify(error));
                        }
                    });
                });
            });
        });
    });
});
