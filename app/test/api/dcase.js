

var dcase = require('../../api/dcase')

describe('api', function () {
    describe('dcase', function () {
        describe('getDCaseList', function () {
            it('should return result', function (done) {
                dcase.getDCaseList(null, {
                    onSuccess: function (result) {
                        console.log(result);
                    },
                    onFailure: function (error) {
                    }
                });
                done();
            });
        });
        describe('getDCase', function () {
            it('should return result', function (done) {
                dcase.getDCase({
                    dcaseId: 50
                }, {
                    onSuccess: function (result) {
                        console.log(result);
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
                        console.log(result);
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
                        console.log(result);
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
                        console.log(result);
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
                        console.log(result);
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
                        console.log(result);
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
