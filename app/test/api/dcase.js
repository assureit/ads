var assert = require('assert')

var dcase = require('../../api/dcase')

var expect = require('expect.js');
describe('api', function () {
    describe('dcase', function () {
        describe('getDCaseList', function () {
            it('should return result', function (done) {
                dcase.getDCaseList(null, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(error);
                    }
                });
            });
            it('allow page 0 as 1', function (done) {
                dcase.getDCaseList({
                    page: 0
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(error);
                    }
                });
            });
            it('dcaseList should be limited length', function (done) {
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result) {
                        assert.equal(20, result.dcaseList.length);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(error);
                    }
                });
            });
            it('provides paging feature', function (done) {
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result) {
                        assert.notStrictEqual(result.summary, undefined);
                        assert.notStrictEqual(result.summary.currentPage, undefined);
                        assert.notStrictEqual(result.summary.maxPage, undefined);
                        assert.notStrictEqual(result.summary.totalItems, undefined);
                        assert.notStrictEqual(result.summary.itemsPerPage, undefined);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(error);
                    }
                });
            });
            it('provides paging feature', function (done) {
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.getDCaseList({
                            page: 2
                        }, {
                            onSuccess: function (result) {
                                assert.notEqual(result1st.summary.dcaseList[0].dcaseId, result.summary.dcaseList[0].dcaseId);
                                done();
                            },
                            onFailure: function (error) {
                                expect().fail(error);
                            }
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(error);
                    }
                });
            });
        });
        describe('getDCase', function () {
            it('should return result', function (done) {
                dcase.getDCase({
                    dcaseId: 50
                }, {
                    onSuccess: function (result) {
                    },
                    onFailure: function (error) {
                    }
                });
                done();
            });
        });
        describe('getNodeTree', function () {
            it('should return result', function (done) {
                dcase.getNodeTree({
                    commitId: 42
                }, {
                    onSuccess: function (result) {
                    },
                    onFailure: function (error) {
                    }
                });
                done();
            });
        });
        describe('getCommitList', function () {
            it('should return result', function (done) {
                dcase.getCommitList({
                    dcaseId: 50
                }, {
                    onSuccess: function (result) {
                    },
                    onFailure: function (error) {
                    }
                });
                done();
            });
        });
        describe('searchDCase', function () {
            it('should return result', function (done) {
                dcase.searchDCase({
                    text: 'dcase1'
                }, {
                    onSuccess: function (result) {
                    },
                    onFailure: function (error) {
                    }
                });
                done();
            });
        });
        describe('createDCase', function () {
            it('should return result', function (done) {
                dcase.createDCase({
                    dcaseName: 'test dcase',
                    contents: {
                        NodeCount: 3,
                        TopGoalId: 1,
                        NodeList: [
                            {
                                ThisNodeId: 1,
                                Description: "dcase1",
                                Children: [
                                    2
                                ],
                                NodeType: "Goal"
                            }, 
                            {
                                ThisNodeId: 2,
                                Description: "s1",
                                Children: [
                                    3
                                ],
                                NodeType: "Strategy"
                            }, 
                            {
                                ThisNodeId: 3,
                                Description: "g1",
                                Children: [],
                                NodeType: "Goal"
                            }
                        ]
                    }
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        console.log('err');
                        console.log(error);
                        done();
                    }
                });
            });
        });
        describe('deleteDCase', function () {
            it('should return result', function (done) {
                dcase.deleteDCase({
                    dcaseId: 36
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        console.log('err');
                        console.log(error);
                        done();
                    }
                });
            });
        });
        describe('editDCase', function () {
            it('should return result', function (done) {
                dcase.editDCase({
                    dcaseId: 37,
                    dcaseName: 'modified dcase name'
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        console.log('err');
                        console.log(error);
                        done();
                    }
                });
            });
        });
        describe('commit', function () {
            it('should return result', function (done) {
                dcase.commit({
                    commitId: 12,
                    commitMessage: 'test',
                    contents: {
                        NodeCount: 3,
                        TopGoalId: 1,
                        NodeList: [
                            {
                                ThisNodeId: 1,
                                Description: "dcase1",
                                Children: [
                                    2
                                ],
                                NodeType: "Goal"
                            }, 
                            {
                                ThisNodeId: 2,
                                Description: "s1",
                                Children: [
                                    3
                                ],
                                NodeType: "Strategy"
                            }, 
                            {
                                ThisNodeId: 3,
                                Description: "g1",
                                Children: [],
                                NodeType: "Goal"
                            }
                        ]
                    }
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (error) {
                        console.log('err');
                        console.log(error);
                        done();
                    }
                });
            });
        });
    });
});
