///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../DefinitelyTyped/expect.js/expect.js.d.ts'/>

import assert = module('assert')
import db = module('../../db/db')
import rec = module('../../api/rec')
import error = module('../../api/error')
import http = module('http')
import constant = module('../../constant')

var userId = constant.SYSTEM_USER_ID;
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
		var server = null;

		before((done) => {
			server = app.listen(3030).on('listening', done);
		});

		after(() => {
			server.close();
		});

		describe('getRawItemList', function() {
			it('call method', function(done) {
				rec.getRawItemList(null, userId, {
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
			it('Datatype is required when a parameter exists', function(done) {
				rec.getRawItemList({}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.be('Invalid method parameter is found: \nDatatype is required when a parameter exists.');
						done();
					}
				});
			});
			it('The unexpected parameter is specified', function(done) {
				rec.getRawItemList({datatype: 'aaaa', aaa:'aaa'}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.be('Invalid method parameter is found: \nThe unexpected parameter is specified.');
						done();
					}
				});
			});
		});
		describe('getPresetList', function() {
			it('call method', function(done) {
				rec.getPresetList(null, userId, {
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
			it('do not specify the parameter ', function(done) {
				rec.getPresetList({datatype: "aaa"}, userId, {
					onSuccess: (result: any) => {
						expect(result).to.be(null);
						done();
					},
					onFailure: (err: error.RPCError) => {
						expect(err.rpcHttpStatus).to.be(200);
						expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
						expect(err.message).to.be('Invalid method parameter is found: \nDo not specify the parameter.');
						done();
					}
				});
			});
		});
	});
});
