var db = require('../../db/db')
var model_node = require('../../model/node')

var expect = require('expect.js');
describe('model', function () {
    describe('node', function () {
        var con;
        var nodeDAO;
        beforeEach(function (done) {
            con = new db.Database();
            con.begin(function (err, result) {
                nodeDAO = new model_node.NodeDAO(con);
                done();
            });
        });
        afterEach(function (done) {
            if(con) {
                con.rollback(function (err, result) {
                    con.close();
                    if(err) {
                        throw err;
                    }
                    done();
                });
            }
        });
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
                nodeDAO.processMetaDataList(100, 107, node.MetaData, function (err) {
                    expect(err).to.be(null);
                    expect(node.MetaData[0].IssueId).not.to.be(undefined);
                    done();
                });
            });
        });
    });
});
