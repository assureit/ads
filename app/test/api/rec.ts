///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db')
import rec = module('../../api/rec')
import error = module('../../api/error')
import http = module('http')

// import expect = module('expect.js')
var expect = require('expect.js');	// TODO: import module化
var express = require('express');

var server = express();

server.post('/rec/api/1.0', function (req, res) {
        res.header('Content-Type', 'application/json');
        res.send({result:'OK'});
});



describe('api', function() {
	describe('rec', function() {

		before((done) => {
			server.listen(3001).on('listening', done);
		});

		describe('getRawItemList', function() {
			it('call method', function(done) {
				rec.getRawItemList(null, {
					onSuccess: (result: any) => {
console.log(result);
console.log('------------');
						done();
					},
					onFailure: (err: any) => {
						expect(err).to.be(null);
						done();
					}
				});
			});
		});
		describe('getPresetList', function() {
			it('call method', function(done) {
				rec.getPresetList(null, {
					onSuccess: (result: any) => {
console.log(result);
console.log('------------');
						done();
					},
					onFailure: (err: any) => {
						expect(err).to.be(null);
						done();
					}
				});
			});
		});
	});
});
