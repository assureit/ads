///<reference path='../../DefinitelyTyped/mocha/mocha.d.ts'/>
///<reference path='../../DefinitelyTyped/node/node.d.ts'/>

// reference: http://nodejs.org/api/assert.html
// reference: http://visionmedia.github.io/mocha/
// reference: https://github.com/visionmedia/supertest

import assert = module('assert')
var expect = require('expect.js');	// TODO: import module化
//import ldap = module('ldapjs')	// TODO* import module化
var ldap = require('ldapjs');
import net_ldap = module('../../net/ldap')
var CONFIG = require('config');
var ldapDummy = require('../ldap');

describe('net', () => {
	describe('ldap', () => {
		var server = null;
		before((done) => {
			server = ldapDummy.app.listen(CONFIG.ldap.dummy.port, CONFIG.ldap.dummy.ip, function() {
				var client = ldap.createClient({url: CONFIG.ldap.url});
				var entry = {
					cn: 'unittest01',
					sn: 'unittest01',
					objectClass: 'inetOrgPerson',
					userPassword: 'unittest01'
					};
				
				client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function(err) {
					var dn = CONFIG.ldap.dn.replace('$1', 'unittest01');
					client.add(dn, entry, function(err) {
						client.unbind(function(err) {
							done();
						});
					});
				});
			});
		});

		after(() => {
			server.close();
		});


		describe('auth', () => {
			it('auth OK', function(done) {

				var ld = new net_ldap.Ldap();
				ld.auth('unittest01', 'unittest01', (err: any) => {
					assert.ifError(err);
					done();
				});
			});
		});
		describe('add', () => {
			it('add OK', function(done) {
				
				var ld = new net_ldap.Ldap();
				ld.add('unittest02', 'unittest02', (err: any) => {
					assert.ifError(err);
					var client = ldap.createClient({url: CONFIG.ldap.url});
					var dn = CONFIG.ldap.dn.replace('$1', 'unittest02');
					client.bind(dn, 'unittest02', function(err) {
						assert.ifError(err);
						client.unbind(function(err) {
							assert.ifError(err);
							done();
						});
					});
				});

			});
		});
	});
})
