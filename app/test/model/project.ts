///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import db = module('../../db/db')
import model_project = module('../../model/project')
import error = module('../../api/error')
import testdata = module('../testdata')
var expect = require('expect.js');	// TODO: import module化
var async = require('async')

describe('model', function() {
	var testDB;
	var con: db.Database
	var projectDAO: model_project.ProjectDAO;
	var userId:number = 101;

	beforeEach(function (done) {
		testdata.begin(['test/model/project.yaml'], (err:any, c:db.Database) => {
			con = c;
			projectDAO = new model_project.ProjectDAO(con);
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
	describe('project', function() {
		describe('updateMember', function() {
			it('update project members from stakeholder case', function(done) {
				projectDAO.updateMember(1001, (err: any) => {
					expect(err).to.be(null);
					con.query('SELECT * FROM project_has_user WHERE project_id=1001', (err, result) => {
						console.log(result);
						done();
					});
				});
			});
		});
	});
});
