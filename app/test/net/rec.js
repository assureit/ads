
var rec = require('../../net/rec');
var expect = require('expect.js');
var express = require('express');
var CONFIG = require('config');

var app = express();

var responseFlag = true;
var recRequestBody;

app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    recRequestBody = req.body;
    if (responseFlag) {
        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: 1 }));
    } else {
        res.send(JSON.stringify({ jsonrpc: "2.0", id: 1 }), 500);
    }
});

describe('net', function () {
    var server = null;
    before(function (done) {
        server = app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
    });

    describe('rec', function () {
        describe('request', function () {
            it('normal end', function (done) {
                responseFlag = true;
                var rc = new rec.Rec();
                rc.request('test_method', {}, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.jsonrpc).to.eql("2.0");
                    expect(result.result).to.be(null);
                    expect(result.id).to.eql(1);
                    done();
                });
            });
            it('abnormal end', function (done) {
                responseFlag = false;
                var rc = new rec.Rec();
                rc.request('test_method', {}, function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).not.to.be(null);
                    expect(err.rpcHttpStatus).not.to.be(undefined);
                    expect(err.rpcHttpStatus).to.eql(500);
                    done();
                });
            });
            it('request parameter check', function (done) {
                responseFlag = true;
                recRequestBody = null;
                var rc = new rec.Rec();
                rc.request('test_method', { check: 'test' }, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.jsonrpc).to.eql("2.0");
                    expect(result.result).to.be(null);
                    expect(result.id).to.eql(1);
                    expect(recRequestBody).not.to.be(null);
                    expect(recRequestBody.method).to.be('test_method');
                    expect(recRequestBody.params.check).to.be('test');
                    done();
                });
            });
        });
    });
});

