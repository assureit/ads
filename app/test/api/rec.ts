///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');
import rec = module('../../api/rec')
import error = module('../../api/error')
// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化

describe('api', function() {
	describe('rec', function() {
		describe('getRawItemList', function() {
			it('', function(done) {
				rec.getRawItemList(null, {
					onSuccess: (result: any) => {
						done();
					},
					onFailure: (err: any) => {
						done();
					}
				});
			});
		});
		describe('getPresetList', function() {
			it('', function(done) {
				rec.getPresetList(null, {
					onSuccess: (result: any) => {
						done();
					},
					onFailure: (err: any) => {
						done();
					}
				});
			});
		});
	});
});
