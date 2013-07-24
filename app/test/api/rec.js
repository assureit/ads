

var rec = require('../../api/rec');
var error = require('../../api/error');

var constant = require('../../constant');

var userId = constant.SYSTEM_USER_ID;

var expect = require('expect.js');
var express = require('express');

var app = express();
app.use(express.bodyParser());

app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    var resbody;

    if (req.body.method == 'getRawItemList') {
        resbody = { "jsonrpc": "2.0", "result": { "list": [{ "watchID": "serverA_CPU", "name": "サーバAのCPU負荷", "datatype": "linux_cpu" }] }, "id": 1 };
    } else {
        resbody = { "jsonrpc": "2.0", "result": { "items": [{ "presetID": "CPU_upper_Check", "name": "CPU高負荷チェック", "datatype": "linux_cpu", "paramName": ["between", "reference"], "normalComment": "$$0は正常に稼働しています。", "errorComment": "$$0が高負荷です（$$1秒間の平均ロードアベレージが$$2以上です）" }] }, "id": 1 };
    }

    res.send(resbody);
});

describe('api', function () {
    describe('rec', function () {
        var server = null;

        before(function (done) {
            server = app.listen(3030).on('listening', done);
        });

        after(function () {
            server.close();
        });

        describe('getRawItemList', function () {
            it('call method', function (done) {
                rec.getRawItemList(null, userId, {
                    onSuccess: function (result) {
                        expect(result.list).not.to.be(null);
                        expect(result.list[0].watchID).not.to.be(null);
                        expect(result.list[0].watchID).not.to.be(undefined);
                        expect(result.list[0].watchID).to.eql('serverA_CPU');
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('Datatype is required when a parameter exists', function (done) {
                rec.getRawItemList({}, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nDatatype is required when a parameter exists.');
                        done();
                    }
                });
            });
            it('The unexpected parameter is specified', function (done) {
                rec.getRawItemList({ datatype: 'aaaa', aaa: 'aaa' }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nThe unexpected parameter is specified.');
                        done();
                    }
                });
            });
        });
        describe('getPresetList', function () {
            it('call method', function (done) {
                rec.getPresetList(null, userId, {
                    onSuccess: function (result) {
                        expect(result.items).not.to.be(null);
                        expect(result.items[0].presetID).not.to.be(null);
                        expect(result.items[0].presetID).not.to.be(undefined);
                        expect(result.items[0].presetID).to.eql('CPU_upper_Check');
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('do not specify the parameter ', function (done) {
                rec.getPresetList({ datatype: "aaa" }, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
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

