///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_node = module('../../model/node')
import model_monitor = module('../../model/monitor')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')


describe('model', function() {
    var testDB;
	var con: db.Database
	var nodeDAO: model_node.NodeDAO;
	var monitorDAO: model_monitor.MonitorDAO;
	beforeEach(function (done) {
		testdata.begin([], (err:any, c:db.Database) => {
			con = c;
			nodeDAO = new model_node.NodeDAO(con);
			monitorDAO = new model_monitor.MonitorDAO(con);
			done();
		});
	});
	afterEach(function (done) {
		con.rollback(function (err, result) {
			con.close();
			if(err) {
				throw err;
			}
			done();
		});
	});
	describe('node', function() {
		describe('process', function() {
			it('should create issue if metadata exists', function(done) {
				var node: model_node.NodeData = {
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
				var nodeList: model_node.NodeData[] = [
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
					expect(node.MetaData[0]['_MonitorNodeId']).not.to.be(null);
					expect(node.MetaData[0]['_MonitorNodeId']).not.to.be(undefined);
					monitorDAO.get(node.MetaData[0]['_MonitorNodeId'], (err:any, result:model_monitor.MonitorNode) => {
						expect(err).to.be(null);
						expect(result.thisNodeId).to.equal(1);
						expect(result.params.A).to.equal('Value A2');
						expect(result.params.B).to.equal('Value B');
						expect(result.params.C).to.equal('Value C');
						done();
					});
				});
			});
			it('should update montor_node if metadata is changed', function(done) {
				var node = {
					NodeType: "Monitor",
					Description: "description",
					ThisNodeId: 1,
					Children: [], 
					Contexts: [], 
					MetaData: [
						{   
							Type: "Monitor",
							_MonitorNodeId: 1001,
							PresetId: "123",
							WatchId: "456",
							Visible: "true",
						},
					]
				};
				var nodeList: model_node.NodeData[] = [
					node, 
				];
				nodeDAO.processMetaDataList(201, 401, node, node.MetaData, nodeList, (err: any) => {
					expect(err).to.be(null);
					expect(node.MetaData[0]['_MonitorNodeId']).not.to.be(null);
					expect(node.MetaData[0]['_MonitorNodeId']).not.to.be(undefined);
					monitorDAO.get(node.MetaData[0]['_MonitorNodeId'], (err:any, result:model_monitor.MonitorNode) => {
						expect(err).to.be(null);
						expect(result.thisNodeId).to.equal(1);
						expect(result.presetId).to.equal('123');
						expect(result.watchId).to.equal('456');
						done();
					});
				});
			});
		});
	});
});
