var assert = require('assert')
var expect = require('expect.js');
var ldap = require('ldapjs');
var net_ldap = require('../../net/ldap')
var CONFIG = require('config');
describe('net', function () {
    describe('ldap', function () {
        before(function (done) {
            var client = ldap.createClient({
                url: CONFIG.ldap.url
            });
            var entry = {
                cn: 'unittest01',
                sn: 'unittest01',
                objectClass: 'inetOrgPerson',
                userPassword: 'unittest01'
            };
            client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function (err) {
                var dn = CONFIG.ldap.dn.replace('$1', 'unittest01');
                client.add(dn, entry, function (err) {
                    client.unbind(function (err) {
                        done();
                    });
                });
            });
        });
        after(function (done) {
            var client = ldap.createClient({
                url: CONFIG.ldap.url
            });
            client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function (err) {
                var dn = CONFIG.ldap.dn.replace('$1', 'unittest01');
                client.del(dn, function (err) {
                    var dn2 = CONFIG.ldap.dn.replace('$1', 'unittest02');
                    client.del(dn2, function (err) {
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
                        url: CONFIG.ldap.url
                    });
                    var dn = CONFIG.ldap.dn.replace('$1', 'unittest02');
                    client.bind(dn, 'unittest02', function (err) {
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
