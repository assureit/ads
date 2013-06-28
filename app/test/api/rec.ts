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

var app = express();
app.use(express.bodyParser());

app.post('/rec/api/1.0', function (req: any, res: any) {
        res.header('Content-Type', 'application/json');
        res.send(req.body);
});



describe('api', function() {
	describe('rec', function() {

		before((done) => {
			app.listen(3030).on('listening', done);
		});

		describe('getRawItemList', function() {
			it('call method', function(done) {
				rec.getRawItemList(null, {
					onSuccess: (result: any) => {
						expect(result.method).to.eql('getRawItemList');
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
						expect(result.method).to.eql('getPresetList');
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
