var assert = require('assert')
var db = require('../../db/db')
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('provides paging feature', function (done) {
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result) {
                        expect(result.summary).not.to.be(undefined);
                        expect(result.summary.currentPage).not.to.be(undefined);
                        expect(result.summary.maxPage).not.to.be(undefined);
                        expect(result.summary.totalItems).not.to.be(undefined);
                        expect(result.summary.itemsPerPage).not.to.be(undefined);
                        var con = new db.Database();
                        con.query('SELECT count(d.id) as cnt FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE', function (err, expectResult) {
                            if(err) {
                                con.close();
                                throw err;
                            }
                            expect(result.summary.totalItems).to.be(expectResult[0].cnt);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('can return next page result', function (done) {
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.getDCaseList({
                            page: 2
                        }, {
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
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.getDCaseList({
                            page: 0
                        }, {
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
                dcase.getDCaseList({
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.getDCaseList({
                            page: -1
                        }, {
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
                con.query('SELECT d.* FROM dcase d, commit c, user u, user cu WHERE d.id = c.dcase_id AND d.user_id = u.id AND c.user_id = cu.id AND c.latest_flag = TRUE AND d.delete_flag = FALSE ORDER BY c.modified desc LIMIT 1', function (err, expectResult) {
                    if(err) {
                        con.close();
                        throw err;
                    }
                    dcase.getDCaseList({
                        page: 1
                    }, {
                        onSuccess: function (result) {
                            assert.equal(result.dcaseList[0].dcaseId, expectResult[0].id);
                            done();
                        },
                        onFailure: function (error) {
                            expect().fail(JSON.stringify(error));
                        }
                    });
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
                    }
                });
                done();
            });
            it('dcaseList should be limited length', function (done) {
                dcase.searchDCase({
                    text: 'dcase1',
                    page: 1
                }, {
                    onSuccess: function (result) {
                        assert.equal(20, result.searchResultList.length);
                        done();
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
            it('provides paging feature', function (done) {
                var query = 'dcase1';
                dcase.searchDCase({
                    text: query,
                    page: 1
                }, {
                    onSuccess: function (result) {
                        expect(result.summary).not.to.be(undefined);
                        expect(result.summary.currentPage).not.to.be(undefined);
                        expect(result.summary.maxPage).not.to.be(undefined);
                        expect(result.summary.totalItems).not.to.be(undefined);
                        expect(result.summary.itemsPerPage).not.to.be(undefined);
                        var con = new db.Database();
                        con.query('SELECT count(n.id) FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ?', [
                            '%' + query + '%'
                        ], function (err, expectedResult) {
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
                var query = 'dcase1';
                dcase.searchDCase({
                    text: query,
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({
                            text: query,
                            page: 2
                        }, {
                            onSuccess: function (result) {
                                expect({
                                    dcaseId: result.searchResultList[0].dcaseId,
                                    thisNodeId: result.searchResultList[0].this_node_id
                                }).not.to.eql({
                                    dcaseId: result1st.searchResultList[0].dcaseId,
                                    this_node_id: result1st.searchResultList[0].this_node_id
                                });
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
                var query = 'dcase1';
                dcase.searchDCase({
                    text: query,
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({
                            text: query,
                            page: 0
                        }, {
                            onSuccess: function (result) {
                                expect({
                                    dcaseId: result.searchResultList[0].dcaseId,
                                    thisNodeId: result.searchResultList[0].this_node_id
                                }).to.eql({
                                    dcaseId: result1st.searchResultList[0].dcaseId,
                                    this_node_id: result1st.searchResultList[0].this_node_id
                                });
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
                var query = 'dcase1';
                dcase.searchDCase({
                    text: query,
                    page: 1
                }, {
                    onSuccess: function (result1st) {
                        dcase.searchDCase({
                            text: query,
                            page: -1
                        }, {
                            onSuccess: function (result) {
                                expect({
                                    dcaseId: result.searchResultList[0].dcaseId,
                                    thisNodeId: result.searchResultList[0].this_node_id
                                }).to.eql({
                                    dcaseId: result1st.searchResultList[0].dcaseId,
                                    this_node_id: result1st.searchResultList[0].this_node_id
                                });
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
                var query = 'dcase1';
                var con = new db.Database();
                con.query({
                    sql: 'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ?',
                    nestTables: true
                }, [
                    '%' + query + '%'
                ], function (err, expectedResult) {
                    if(err) {
                        con.close();
                        throw err;
                    }
                    dcase.searchDCase({
                        text: query,
                        page: 1
                    }, {
                        onSuccess: function (result) {
                            expect({
                                dcaseId: result.searchResultList[0].dcaseId,
                                thisNodeId: result.searchResultList[0].this_node_id
                            }).to.eql({
                                dcaseId: expectedResult.searchResultList[0].dcaseId,
                                this_node_id: expectedResult.searchResultList[0].this_node_id
                            });
                            done();
                        },
                        onFailure: function (error) {
                            expect().fail(JSON.stringify(error));
                        }
                    });
                });
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
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
                        expect().fail(JSON.stringify(error));
                    }
                });
            });
        });
    });
});
