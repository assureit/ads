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

describe('net', () => {
	describe('ldap', () => {
		before((done) => {
			var client = ldap.createClient({url: 'ldap://127.0.0.1/cn=root,dc=assureit,dc=org'});
			var entry = {
				cn: 'unittest01',
				sn: 'unittest01',
				objectClass: 'inetOrgPerson',
				userPassword: 'unittest01'
				};
				
			client.bind('cn=root,dc=assureit,dc=org', 'vOCDYE66', function(err) {
				client.add('uid=unittest01,ou=user,dc=assureit,dc=org', entry, function(err) {
					client.unbind(function(err) {
						done();
					});
				});
			});
		});

		after((done) => {
			var client = ldap.createClient({url: 'ldap://127.0.0.1/cn=root,dc=assureit,dc=org'});
			client.bind('cn=root,dc=assureit,dc=org', 'vOCDYE66', function(err) {
				client.del('uid=unittest01,ou=user,dc=assureit,dc=org', function(err) {
					client.del('uid=unittest02,ou=user,dc=assureit,dc=org', function(err) {
						client.unbind(function(err) {
							done();		
						});
					});
				});
			});
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
					var client = ldap.createClient({url: 'ldap://127.0.0.1/cn=root,dc=assureit,dc=org'});
					client.bind('uid=unittest02,ou=user,dc=assureit,dc=org', 'unittest02', function(err) {
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
