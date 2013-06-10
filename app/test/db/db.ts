///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

import assert = module('assert')
import db = module('../../db/db');

describe('db', function() {
	describe('query', function() {
		it('should return result', function(done) {
			var con = new db.Database();
			con.query('SELECT 1', (err, result) => {
				assert.strictEqual(err, null);
				assert.equal(1, result.length);
				assert.equal(result[0]['1'], 1);
				con.close((err, result) => {});
				done();
			});
		});
	});
});
