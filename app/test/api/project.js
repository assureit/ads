
var db = require('../../db/db');
var project = require('../../api/project');


var testdata = require('../testdata');




var expect = require('expect.js');
var CONFIG = require('config');

var userId = 101;

describe('api', function () {
    var con;
    var validParam;
    beforeEach(function (done) {
        testdata.load([], function (err) {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('project', function () {
        describe('createProject', function () {
            it('should return result', function (done) {
                var param = { name: 'project name', isPublic: true };
                project.createProject(param, userId, {
                    onSuccess: function (result) {
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result.projectId).not.to.be(null);
                        expect(result.projectId).not.to.be(undefined);
                        con.query({ sql: 'SELECT * FROM dcase d, commit c, project p, project_has_user pu WHERE d.id = c.dcase_id AND d.project_id = p.id AND p.id = pu.project_id AND p.id=?', nestTables: true }, [result.projectId], function (err, result) {
                            console.log(result);
                            done();
                        });
                    },
                    onFailure: function (error) {
                        expect().fail(JSON.stringify(error));
                        done();
                    }
                });
            });
        });
    });
});

