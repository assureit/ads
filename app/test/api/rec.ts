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
	var resbody:any;

	if (req.body.method == 'getRawItemList') {
		resbody = {"jsonrpc": "2.0","result": {"list": [{"watchID": "serverA_CPU","name": "サーバAのCPU負荷","datatype": "linux_cpu"}]},"id": 1};
	} else {
		resbody = {"jsonrpc": "2.0","result": {"items": [{"presetID": "CPU_upper_Check","name": "CPU高負荷チェック","datatype": "linux_cpu","paramName": ["between", "reference"],"normalComment": "$$0は正常に稼働しています。","errorComment": "$$0が高負荷です（$$1秒間の平均ロードアベレージが$$2以上です）"}]},"id": 1};
	}
	
        res.send(resbody);
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
						expect(result.list).not.to.be(null);
						expect(result.list[0].watchID).not.to.be(null);
						expect(result.list[0].watchID).not.to.be(undefined);
						expect(result.list[0].watchID).to.eql('serverA_CPU');
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
						expect(result.items).not.to.be(null);
						expect(result.items[0].presetID).not.to.be(null);
						expect(result.items[0].presetID).not.to.be(undefined);
						expect(result.items[0].presetID).to.eql('CPU_upper_Check');
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
