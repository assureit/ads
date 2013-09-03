///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')
import constant = module('../../constant')
import testdata = module('../testdata')
import model_commit = module('../../model/commit')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function() {
	var con:db.Database;

	beforeEach(function (done) {
		testdata.load(['test/api/dcase-gettaglist.yaml'], (err:any) => {
	 //        con = new db.Database();
			done();
		});
	});
	afterEach(function (done) {
		testdata.clear((err:any) => done());
	});
		///////////////////////////////////////////////
		describe('getTagList', function() {
			it('should return result', function(done) {
				dcase.getTagList({}, userId, 
					{
						onSuccess: (result: any) => {
							// console.log(result);
							expect(result).not.to.be(null);
							expect(result).not.to.be(undefined);
							expect(result.tagList).not.to.be(null);
							expect(result.tagList).not.to.be(undefined);
							expect(result.tagList).to.be.an('array');
							expect(result.tagList.length > 0).to.equal(true);
							var checkDic = {};
							result.tagList.forEach((it) => {
								expect(it).to.be.an('string');
								expect(it).not.to.equal('deleted_tag');
								expect(it).not.to.equal('unlink_tag');
								expect(checkDic[it]).to.be(undefined);
								checkDic[it] = it;
							});
							done();
						}, 
						onFailure: (error: error.RPCError) => {expect().fail(JSON.stringify(error));done()},
					}
				);
			});
		});
});
