///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import project = module('../../api/project')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')
import util_test = module('../../util/test')
import model_dcase = module('../../model/dcase')
import model_commit = module('../../model/commit')

// import expect = module('expect.js')
var expect = require('expect.js');  // TODO: import module化
var CONFIG = require('config');

var userId = 101;

describe('api', function() {
    var con:db.Database;
    var validParam:any;
    beforeEach(function (done) {
        // validParam = {
        //                 dcaseName: 'test dcase', 
        //                 projectId: 201,
        //                 contents: {
        //                     NodeCount:3,
        //                     TopGoalId:1,
        //                     NodeList:[
        //                         {
        //                             ThisNodeId:1,
        //                             Description:"dcase1",
        //                             Children:[2],
        //                             NodeType:"Goal"
        //                         },
        //                         {
        //                             ThisNodeId:2,
        //                             Description:"s1",
        //                             Children:[3],
        //                             NodeType:"Strategy"
        //                         },
        //                         {
        //                             ThisNodeId:3,
        //                             Description:"g1",
        //                             Children:[],
        //                             NodeType:"Goal"
        //                         }
        //                     ]
        //                 }
        //             };
        testdata.load([], (err:any) => {
            con = new db.Database();
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear((err:any) => done());
    });
    describe('project', function() {

        describe('createProject', function() {
            it('should return result', function(done) {
                var param = {name: 'project name', isPublic:true};
                project.createProject(param, userId, 
                    {
                        onSuccess: (result: any) => {
                            expect(result).not.to.be(null);
                            expect(result).not.to.be(undefined);
                            expect(result.projectId).not.to.be(null);
                            expect(result.projectId).not.to.be(undefined);
                            con.query({sql:'SELECT * FROM dcase d, commit c, project p, project_has_user pu WHERE d.id = c.dcase_id AND d.project_id = p.id AND p.id = pu.project_id AND p.id=?', nestTables:true}, [result.projectId], (err:any, result:any) => {
                                console.log(result);
                                done();
                            });
                        }, 
                        onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done();},
                    }
                );
            });
        });
    });
});
