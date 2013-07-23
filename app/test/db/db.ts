///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

import assert = module('assert')
import db = module('../../db/db')
var expect = require('expect.js')

describe('db', function() {
	describe('query', function() {
		it('should return result', function(done) {
			console.log(process.env.NODE_ENV);
			var con = new db.Database();
			con.query('SELECT 1', (err, result) => {
				expect(err).to.be(null);
				expect(result.length).to.equal(1);
				expect(result[0]['1']).to.equal(1);
				con.close((err, result) => {});
				done();
			});
		});
	});
});
