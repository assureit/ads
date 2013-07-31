///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
import rest = module('../../net/rest')
import error = module('../../api/error')
var expect = require('expect.js');	// TODO: import module化
var CONFIG = require('config')
var dSvr = require('../server')

describe('net', () => {
	var server = null;
	before((done) => {
		server = dSvr.app.listen(3030).on('listening', done);
	});
	after(() => {
		server.close();
	});
	beforeEach((done) => {
		dSvr.setResponseOK(true);
		done();
	});

	describe('rest', () => {
		describe('post', () => {
			it('normal end', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.post('/test/post', 'post string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('post normal response');
					done();
				});
			});
			it('normal end plus header', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.setHeader('test_header', 'return_string');
				req.post('/test/header', 'post string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('return_string');
					done();
				});
			});
			it('normal end plus Content-Type', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.setContentType('text/plain');
				req.post('/test/contenttype', 'post string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('text/plain');
					done();
				});
			});
			it('normal end method post', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.post('/test/check/post', 'post string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('POST');
					done();
				});
			});
			it('host is not set', (done) => {
				var options = {
					port: 3030,
				};
				var req = new rest.Request(options);
				req.post('/test/post', 'post string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					expect(err.rpcHttpStatus).to.be(500);
					expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
					expect(err.message).to.eql('Internal error: host configuration is not found');
					done();
				});
			});
			it('host error', function(done) {
				this.timeout(15000);
				var options = {
					host: 'Xlocalhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.post('/test/post', 'post string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					done();
				});
			});
			it('port error', (done) => {
				var options = {
					host: 'localhost',
				};
				var req = new rest.Request(options);
				req.post('/test/post', 'post string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					done();
				});
			});
			it('path error', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.post('/test/nothing', 'post string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					expect(err.rpcHttpStatus).to.be(500);
					expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
					expect(err.message).to.eql('Internal error: Failed to access: 404');
					expect(err.data.statusCode).to.eql(404);
					done();
				});
			});
			it('return internal server error', (done) => {
				dSvr.setResponseOK(false);
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.post('/test/post', 'post string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					expect(err.rpcHttpStatus).to.be(500);
					expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
					expect(err.message).to.eql('Internal error: Failed to access: 500');
					expect(err.data.statusCode).to.eql(500);
					done();
				});
			});
		});
		describe('put', () => {
			it('normal end', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.put('/test/put', 'put string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('put normal response');
					done();
				});
			});
			it('normal end plus header', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.setHeader('test_header', 'return_string');
				req.put('/test/header', 'put string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('return_string');
					done();
				});
			});
			it('normal end plus Content-Type', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.setContentType('text/plain');
				req.put('/test/contenttype', 'put string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('text/plain');
					done();
				});
			});
			it('normal end method put', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.put('/test/check/put', 'post string', (err:any, result:string) => {
					expect(err).to.be(null);
					expect(result).to.eql('PUT');
					done();
				});
			});
			it('host is not set', (done) => {
				var options = {
					port: 3030,
				};
				var req = new rest.Request(options);
				req.put('/test/put', 'put string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					expect(err.rpcHttpStatus).to.be(500);
					expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
					expect(err.message).to.eql('Internal error: host configuration is not found');
					done();
				});
			});
			it('host error', function(done) {
				this.timeout(15000);
				var options = {
					host: 'Xlocalhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.put('/test/put', 'put string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					done();
				});
			});
			it('port error', (done) => {
				var options = {
					host: 'localhost',
				};
				var req = new rest.Request(options);
				req.put('/test/put', 'put string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					done();
				});
			});
			it('path error', (done) => {
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.put('/test/nothing', 'put string', (err:any, result:string) => {
					expect(err).not.to.be(null);
					expect(err.rpcHttpStatus).to.be(500);
					expect(err.code).to.be(error.RPC_ERROR.INTERNAL_ERROR);
					expect(err.message).to.eql('Internal error: Failed to access: 404');
					expect(err.data.statusCode).to.eql(404);
					done();
				});
			});
			it('return internal server error', (done) => {
				dSvr.setResponseOK(false);
				var options = {
					host: 'localhost',
					port: 3030,
				};
				var req = new rest.Request(options);
				req.put('/test/put', 'post string', (err:any, result:string) => {
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
})
