
var CONFIG = require('config');
var ldap = require('ldapjs');
var Ldap = (function () {
    function Ldap() { }
    Ldap.prototype.auth = function (loginName, password, callback) {
        var client = ldap.createClient({
            url: CONFIG.ldap.url
        });
        var dn = CONFIG.ldap.dn.replace('$1', loginName);
        client.bind(dn, password, function (err) {
            if(err) {
                callback(err);
                return;
            }
            client.unbind(function (err) {
                callback(err);
            });
        });
    };
    Ldap.prototype.add = function (loginName, password, callback) {
        var client = ldap.createClient({
            url: CONFIG.ldap.url
        });
        var dn = CONFIG.ldap.dn.replace('$1', loginName);
        var entry = {
            cn: loginName,
            sn: loginName,
            objectClass: 'inetOrgPerson',
            userPassword: password
        };
        client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function (err) {
            if(err) {
                callback(err);
                return;
            }
            client.add(dn, entry, function (err) {
                if(err) {
                    callback(err);
                    return;
                }
                client.unbind(function (err) {
                    callback(err);
                });
            });
        });
    };
    return Ldap;
})();
exports.Ldap = Ldap;
