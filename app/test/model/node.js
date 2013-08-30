
var model_node = require('../../model/node');
var model_monitor = require('../../model/monitor');

var testdata = require('../testdata');
var expect = require('expect.js');
var async = require('async');

describe('model', function () {
    var testDB;
    var con;
    var nodeDAO;
    var monitorDAO;
    beforeEach(function (done) {
        testdata.begin([], function (err, c) {
            con = c;
            nodeDAO = new model_node.NodeDAO(con);
            monitorDAO = new model_monitor.MonitorDAO(con);
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
                        }
                    ]
                };
                nodeDAO.processMetaDataList(201, 401, node, node.MetaData, [node], function (err) {
                    expect(err).to.be(null);
                    expect(node.MetaData[0]._IssueId).not.to.be(null);
                    expect(node.MetaData[0]._IssueId).not.to.be(undefined);
                    done();
                });
            });
        });
    });
});

