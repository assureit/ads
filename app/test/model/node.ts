///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_node = module('../../model/node')
import model_monitor = module('../../model/monitor')
import error = module('../../api/error')
import testdb = module('../../db/test-db')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')


describe('model', function() {
    var testDB;
	var con: db.Database
	var nodeDAO: model_node.NodeDAO;
	var monitorDAO: model_monitor.MonitorDAO;
    beforeEach(function (done) {
        con = new db.Database();
    	testDB = new testdb.TestDB(con);
		nodeDAO = new model_node.NodeDAO(con);
		monitorDAO = new model_monitor.MonitorDAO(con);
		async.waterfall([
			(next:Function) => {
				con.begin((err:any, result:any) => next(err));
			},
			(next:Function) => {
				testDB.clearAll((err:any) => {next(err);});
			}, 
			(next:Function) => {
				testDB.load('test/default-data.yaml', (err:any) => {next(err);});
			}, 
			], (err:any) => {
				if (err) throw err;
				done();
			}
		);
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
	describe('node', function() {
		describe('process', function() {
			it('should create issue if metadata exists', function(done) {
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
							Visible: "true",
						},
						{
							Type: "LastUpdated",
							User: "Shida",
							Visible: "false",
						},
					]
				};
				nodeDAO.processMetaDataList(201, 401, node, node.MetaData, [node], (err: any) => {
					expect(err).to.be(null);
					expect(node.MetaData[0]._IssueId).not.to.be(null);
					expect(node.MetaData[0]._IssueId).not.to.be(undefined);
					done();
				});
			});

			it('should create montor_node if metadata exists', function(done) {
				var node = {
					NodeType: "Monitor",
					Description: "description",
					ThisNodeId: 1,
					Children: [2, 3], 
					Contexts: [], 
					MetaData: [
						{   
							Type: "Monitor",
							PresetId: "123",
							WatchId: "456",
							Visible: "true",
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
								Visible: "true",
							},
							{
								Type: "LastUpdated",
								User: "Shida",
								Visible: "false",
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
								Visible: "true",
							},
							{
								Type: "LastUpdated",
								User: "Shida",
								Visible: "false",
							},
						]
					}
				];
				nodeDAO.processMetaDataList(201, 401, node, node.MetaData, nodeList, (err: any) => {
					expect(err).to.be(null);
					expect(node.MetaData[0]._MonitorNodeId).not.to.be(null);
					expect(node.MetaData[0]._MonitorNodeId).not.to.be(undefined);
					monitorDAO.get(node.MetaData[0]._MonitorNodeId, (err:any, result:model_monitor.MonitorNode) => {
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
