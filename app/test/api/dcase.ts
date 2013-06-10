///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import dcase = module('../../api/dcase')
import error = module('../../api/error')

describe('api', function() {
	describe('dcase', function() {
		describe('getDCaseList', function() {
			it('should return result', function(done) {
				dcase.getDCaseList(null, {
					onSuccess: (result: any) => {
						console.log(result);
					}, 
					onFailure: (error: error.RPCError) => {},
				});
				done();
			});
		});


		///////////////////////////////////////////////
		describe('createDCase', function() {
			it('should return result', function(done) {
				dcase.createDCase(
					{dcaseName: 'test dcase', contents: {}}, 
					{
						onSuccess: (result: any) => {
							console.log(result);
							done();
						}, 
						onFailure: (error: error.RPCError) => {
							console.log('err');
							console.log(error);
							done();
						},
					}
				);
			});
		});
	});
});
