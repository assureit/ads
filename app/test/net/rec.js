
var rec = require('../../net/rec');
var expect = require('expect.js');
var express = require('express');
var CONFIG = require('config');
var dSvr = require('../server');

describe('net', function () {
    var server = null;
    before(function (done) {
        server = dSvr.app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
    });

    beforeEach(function (done) {
        dSvr.setResponseOK(true);
        dSvr.setRecRequestBody(null);
        done();
    });

    describe('rec', function () {
        describe('request', function () {
            it('normal end', function (done) {
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
                dSvr.setResponseOK(false);
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
                var rc = new rec.Rec();
                rc.request('test_method', { check: 'test' }, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.jsonrpc).to.eql("2.0");
                    expect(result.result).to.be(null);
                    expect(result.id).to.eql(1);
                    expect(dSvr.getRecRequestBody()).not.to.be(null);
                    expect(dSvr.getRecRequestBody().method).to.be('test_method');
                    expect(dSvr.getRecRequestBody().params.check).to.be('test');
                    done();
                });
            });
        });
    });
});

