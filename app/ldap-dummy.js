;
(function () {
    var ldap = require('ldapjs');
    var CONFIG = require('config');

    function authorize(req, res, next) {
        var cn;
        req.connection.ldap.bindDN.rdns.forEach(function (val) {
            if (val.cn)
                cn = val.cn;
        });

        if (cn !== 'root') {
            console.log('authorize error');
            return next(new ldap.InsufficientAccessRightsError());
        }
        return next();
    }

    var rootSUFFIX = CONFIG.ldap.root;
    var SUFFIX = 'ou=user,dc=assureit,dc=org';
    var db = {};
    var server = ldap.createServer();

    server.bind(rootSUFFIX, function (req, res, next) {
        console.log('---- BIND ROOT FROM CONFIG: ' + rootSUFFIX);

        var cn;
        req.dn.rdns.forEach(function (val) {
            if (val.cn)
                cn = val.cn;
        });

        if (cn !== 'root' || req.credentials !== CONFIG.ldap.password) {
            console.log('bind root error');
            return next(new ldap.InvalidCredentialsError());
        }
        console.log('---- BIND OK ----');
        res.end();
        return next();
    });

    server.add(SUFFIX, authorize, function (req, res, next) {
        console.log('---- CALL ADD ----');
        res.end();
        return next();
    });

    server.bind(SUFFIX, function (req, res, next) {
        console.log('---- CALL BIND ----');
        res.end();
        return next();
    });

    server.del(SUFFIX, authorize, function (req, res, next) {
        console.log('---- CALL DELETE ----');
        res.end();
        return next();
    });

    server.listen(CONFIG.ldap.dummy.port, CONFIG.ldap.dummy.ip, function () {
        console.log('LDAP server up at: %s', server.url);
    });
})();
