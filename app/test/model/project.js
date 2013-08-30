
var model_project = require('../../model/project');

var testdata = require('../testdata');
var expect = require('expect.js');
var async = require('async');

describe('model', function () {
    var testDB;
    var con;
    var projectDAO;
    var userId = 101;

    beforeEach(function (done) {
        testdata.begin(['test/model/project.yaml'], function (err, c) {
            con = c;
            projectDAO = new model_project.ProjectDAO(con);
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
    describe('project', function () {
        describe('updateMember', function () {
            it('update project members from stakeholder case', function (done) {
                projectDAO.updateMember(1001, function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM project_has_user WHERE project_id=1001', function (err, result) {
                        console.log(result);
                        done();
                    });
                });
            });
        });
    });
});

