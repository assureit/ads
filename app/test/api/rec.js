

var rec = require('../../api/rec');
var error = require('../../api/error');

var constant = require('../../constant');

var userId = constant.SYSTEM_USER_ID;

var expect = require('expect.js');
var dSvr = require('../server');

describe('api', function () {
    describe('rec', function () {
        var server = null;

        before(function (done) {
            server = dSvr.app.listen(3030).on('listening', done);
        });

        after(function () {
            server.close();
        });

        beforeEach(function (done) {
            dSvr.setRecRequestBody(null);
            dSvr.setResponseOK(true);
            done();
        });

        describe('getRawItemList', function () {
            it('call method', function (done) {
                rec.getRawItemList(null, userId, {
                    onSuccess: function (result) {
                        expect(result.list).not.to.be(null);
                        expect(result.list[0].watchID).not.to.be(null);
                        expect(result.list[0].watchID).not.to.be(undefined);
                        expect(result.list[0].watchID).to.eql('serverA_CPU');
                        expect(dSvr.getRecRequestBody()).not.to.be(null);
                        expect(dSvr.getRecRequestBody().method).to.eql('getRawItemList');
                        expect(dSvr.getRecRequestBody().params).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('call method with parameter', function (done) {
                rec.getRawItemList({ datatype: 'test_data_type' }, userId, {
                    onSuccess: function (result) {
                        expect(result.list).not.to.be(null);
                        expect(result.list[0].watchID).not.to.be(null);
                        expect(result.list[0].watchID).not.to.be(undefined);
                        expect(result.list[0].watchID).to.eql('serverA_CPU');
                        expect(dSvr.getRecRequestBody()).not.to.be(null);
                        expect(dSvr.getRecRequestBody().method).to.eql('getRawItemList');
                        expect(dSvr.getRecRequestBody().params.datatype).to.eql('test_data_type');
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
                        expect(dSvr.getRecRequestBody()).not.to.be(null);
                        expect(dSvr.getRecRequestBody().method).to.eql('getPresetList');
                        expect(dSvr.getRecRequestBody().params).to.be(null);
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

