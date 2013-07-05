var assert = require('assert')
var expect = require('expect.js');
var ldap = require('ldapjs');
var net_ldap = require('../../net/ldap')
describe('net', function () {
    describe('ldap', function () {
        before(function (done) {
            var client = ldap.createClient({
                url: 'ldap://127.0.0.1/cn=root,dc=assureit,dc=org'
            });
            var entry = {
                cn: 'unittest01',
                sn: 'unittest01',
                objectClass: 'inetOrgPerson',
                userPassword: 'unittest01'
            };
            client.bind('cn=root,dc=assureit,dc=org', 'vOCDYE66', function (err) {
                client.add('uid=unittest01,ou=user,dc=assureit,dc=org', entry, function (err) {
                    client.unbind(function (err) {
                        done();
                    });
                });
            });
        });
        after(function (done) {
            var client = ldap.createClient({
                url: 'ldap://127.0.0.1/cn=root,dc=assureit,dc=org'
            });
            client.bind('cn=root,dc=assureit,dc=org', 'vOCDYE66', function (err) {
                client.del('uid=unittest01,ou=user,dc=assureit,dc=org', function (err) {
                    client.del('uid=unittest02,ou=user,dc=assureit,dc=org', function (err) {
                        client.unbind(function (err) {
                            done();
                        });
                    });
                });
            });
        });
        describe('auth', function () {
            it('auth OK', function (done) {
                var ld = new net_ldap.Ldap();
                ld.auth('unittest01', 'unittest01', function (err) {
                    assert.ifError(err);
                    done();
                });
            });
        });
        describe('add', function () {
            it('add OK', function (done) {
                var ld = new net_ldap.Ldap();
                ld.add('unittest02', 'unittest02', function (err) {
                    assert.ifError(err);
                    var client = ldap.createClient({
                        url: 'ldap://127.0.0.1/cn=root,dc=assureit,dc=org'
                    });
                    client.bind('uid=unittest02,ou=user,dc=assureit,dc=org', 'unittest02', function (err) {
                        assert.ifError(err);
                        client.unbind(function (err) {
                            assert.ifError(err);
                            done();
                        });
                    });
                });
            });
        });
    });
});
