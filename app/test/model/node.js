var db = require('../../db/db')
var model_node = require('../../model/node')
var model_monitor = require('../../model/monitor')

var testdb = require('../../db/test-db')
var testdata = require('../testdata')
var expect = require('expect.js');
var async = require('async');
describe('model', function () {
    var testDB;
    var con;
    var nodeDAO;
    var monitorDAO;
    beforeEach(function (done) {
        con = new db.Database();
        testDB = new testdb.TestDB(con);
        nodeDAO = new model_node.NodeDAO(con);
        monitorDAO = new model_monitor.MonitorDAO(con);
        async.waterfall([
            function (next) {
                testdata.load([
                    'test/default-data.yaml'
                ], function (err) {
                    return next(err);
                });
            }, 
            function (next) {
                con.begin(function (err, result) {
                    return next(err);
                });
            }, 
            
        ], function (err) {
            if(err) {
                throw err;
            }
            done();
        });
    });
    afterEach(function (done) {
        async.waterfall([
            function (next) {
                if(con) {
                    con.rollback(function (err, result) {
                        return next(err);
                    });
                } else {
                    next();
                }
            }, 
            function (next) {
                if(con) {
                    con.close(function (err, result) {
                        return next(err);
                    });
                } else {
                    next();
                }
            }, 
            function (next) {
                testdata.clear(function (err) {
                    return next(err);
                });
            }, 
            
        ], function (err) {
            if(err) {
                throw err;
            }
            done();
        });
    });
    describe('node', function () {
        describe('process', function () {
            it('should create issue if metadata exists', function (done) {
                var node = {
                    NodeType: "Goal",
                    Description: "description",
                    ThisNodeId: 1,
                    Children: [],
                    Contexts: [],
                    MetaData: [
                        {
                            Type: "Issue",
                            Subject: "このゴールを満たす必要がある",
                            Description: "詳細な情報をここに記述する",
                            Visible: "true"
                        }, 
                        {
                            Type: "LastUpdated",
                            User: "Shida",
                            Visible: "false"
                        }, 
                        
                    ]
                };
                nodeDAO.processMetaDataList(201, 401, node, node.MetaData, [
                    node
                ], function (err) {
                    expect(err).to.be(null);
                    expect(node.MetaData[0]._IssueId).not.to.be(null);
                    expect(node.MetaData[0]._IssueId).not.to.be(undefined);
                    done();
                });
            });
            it('should create montor_node if metadata exists', function (done) {
                var node = {
                    NodeType: "Monitor",
                    Description: "description",
                    ThisNodeId: 1,
                    Children: [
                        2, 
                        3
                    ],
                    Contexts: [],
                    MetaData: [
                        {
                            Type: "Monitor",
                            PresetId: "123",
                            WatchId: "456",
                            Visible: "true"
                        }, 
                        
                    ]
                };
                var nodeList = [
                    node, 
                    {
                        NodeType: "Context",
                        Description: "description",
                        ThisNodeId: 2,
                        Children: [],
                        Contexts: [],
                        MetaData: [
                            {
                                Type: "Parameter",
                                A: "Value A",
                                B: "Value B",
                                Visible: "true"
                            }, 
                            {
                                Type: "LastUpdated",
                                User: "Shida",
                                Visible: "false"
                            }, 
                            
                        ]
                    }, 
                    {
                        NodeType: "Context",
                        Description: "description",
                        ThisNodeId: 3,
                        Children: [],
                        Contexts: [],
                        MetaData: [
                            {
                                Type: "Parameter",
                                C: "Value C",
                                A: "Value A2",
                                Visible: "true"
                            }, 
                            {
                                Type: "LastUpdated",
                                User: "Shida",
                                Visible: "false"
                            }, 
                            
                        ]
                    }
                ];
                nodeDAO.processMetaDataList(201, 401, node, node.MetaData, nodeList, function (err) {
                    expect(err).to.be(null);
                    expect(node.MetaData[0]._MonitorNodeId).not.to.be(null);
                    expect(node.MetaData[0]._MonitorNodeId).not.to.be(undefined);
                    monitorDAO.get(node.MetaData[0]._MonitorNodeId, function (err, result) {
                        expect(err).to.be(null);
                        expect(result.thisNodeId).to.equal(1);
                        expect(result.params.A).to.equal('Value A2');
                        expect(result.params.B).to.equal('Value B');
                        expect(result.params.C).to.equal('Value C');
                        done();
                    });
                });
            });
        });
    });
});
