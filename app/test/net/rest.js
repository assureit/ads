var _this = this;

var rest = require('../../net/rest');
var error = require('../../api/error');
var expect = require('expect.js');
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
        done();
    });

    describe('rest', function () {
        describe('post', function () {
            it('normal end', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.post('/test/post', 'post string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('post normal response');
                    done();
                });
            });
            it('normal end plus header', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.setHeader('test_header', 'return_string');
                req.post('/test/header', 'post string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('return_string');
                    done();
                });
            });
            it('normal end plus Content-Type', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.setContentType('text/plain');
                req.post('/test/contenttype', 'post string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('text/plain');
                    done();
                });
            });
            it('normal end method post', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.post('/test/check/post', 'post string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('POST');
                    done();
                });
            });
            it('host is not set', function (done) {
                var options = {
                    port: 3030
                };
                var req = new rest.Request(options);
                req.post('/test/post', 'post string', function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).to.be(500);
                    expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
                    expect(err.message).to.eql('Internal error: host configuration is not found');
                    done();
                });
            });
            it('host error', function (done) {
                this.timeout(15000);
                var options = {
                    host: 'Xlocalhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.post('/test/post', 'post string', function (err, result) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
            it('port error', function (done) {
                var options = {
                    host: 'localhost'
                };
                var req = new rest.Request(options);
                req.post('/test/post', 'post string', function (err, result) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
            it('path error', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.post('/test/nothing', 'post string', function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).to.be(500);
                    expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
                    expect(err.message).to.eql('Internal error: Failed to access: 404');
                    expect(err.data.statusCode).to.eql(404);
                    done();
                });
            });
            it('return internal server error', function (done) {
                dSvr.setResponseOK(false);
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.post('/test/post', 'post string', function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).to.be(500);
                    expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
                    expect(err.message).to.eql('Internal error: Failed to access: 500');
                    expect(err.data.statusCode).to.eql(500);
                    done();
                });
            });
        });
        describe('put', function () {
            it('normal end', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.put('/test/put', 'put string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('put normal response');
                    done();
                });
            });
            it('normal end plus header', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.setHeader('test_header', 'return_string');
                req.put('/test/header', 'put string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('return_string');
                    done();
                });
            });
            it('normal end plus Content-Type', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.setContentType('text/plain');
                req.put('/test/contenttype', 'put string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('text/plain');
                    done();
                });
            });
            it('normal end method put', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.put('/test/check/put', 'post string', function (err, result) {
                    expect(err).to.be(null);
                    expect(result).to.eql('PUT');
                    done();
                });
            });
            it('host is not set', function (done) {
                var options = {
                    port: 3030
                };
                var req = new rest.Request(options);
                req.put('/test/put', 'put string', function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).to.be(500);
                    expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
                    expect(err.message).to.eql('Internal error: host configuration is not found');
                    done();
                });
            });
            it('host error', function (done) {
                this.timeout(15000);
                var options = {
                    host: 'Xlocalhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.put('/test/put', 'put string', function (err, result) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
            it('port error', function (done) {
                var options = {
                    host: 'localhost'
                };
                var req = new rest.Request(options);
                req.put('/test/put', 'put string', function (err, result) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
            it('path error', function (done) {
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.put('/test/nothing', 'put string', function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).to.be(500);
                    expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
                    expect(err.message).to.eql('Internal error: Failed to access: 404');
                    expect(err.data.statusCode).to.eql(404);
                    done();
                });
            });
            it('return internal server error', function (done) {
                dSvr.setResponseOK(false);
                var options = {
                    host: 'localhost',
                    port: 3030
                };
                var req = new rest.Request(options);
                req.put('/test/put', 'post string', function (err, result) {
                    expect(err).not.to.be(null);
                    expect(err.rpcHttpStatus).to.be(500);
                    expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
                    expect(err.message).to.eql('Internal error: Failed to access: 500');
                    expect(err.data.statusCode).to.eql(500);
                    done();
                });
            });
        });
    });
});

