///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_node = module('../../model/node')
import error = module('../../api/error')
var expect = require('expect.js');	// TODO: import module化


describe('model', function() {
	describe('node', function() {
		var con: db.Database
		var nodeDAO: model_node.NodeDAO;
		beforeEach((done) => {
			con = new db.Database();
			con.begin((err, result) => {
				nodeDAO = new model_node.NodeDAO(con);
				done();
			});
		});

		afterEach((done) => {
			if (con) {
				con.rollback((err, result) => {
					con.close();
					if (err) {
						throw err;
					}
					done();
				});
			}
		});

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
				nodeDAO.processMetaDataList(100, 107, node.MetaData, (err: any) => {
					expect(err).to.be(null);
					expect(node.MetaData[0]._IssueId).not.to.be(undefined);
					done();
				});
			});
		});
	});
});
