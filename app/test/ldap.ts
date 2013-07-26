///<reference path='../DefinitelyTyped/node/node.d.ts'/>
;(() => {

	var CONFIG = require('config');
	var ldap = require('ldapjs');

	var rootSUFFIX = CONFIG.ldap.root;
	var SUFFIX = 'ou=user,dc=assureit,dc=org';
	var db = {};
	
	export var app = ldap.createServer();

	app.bind(rootSUFFIX, function(req, res, next) {
		res.end();
		return next();
	});
	
	app.bind(SUFFIX, function(req, res, next) {
		var dn = req.dn.toString();
		if (!db[dn]) {
			return next(new ldap.NoSuchObjectError(dn));
		}
		if (!db[dn].userpassword) {
			return next(new ldap.NoSuchAttributeError('userPassword'));
		}
		if (db[dn].userpassword[0] !== req.credentials) {
			return next(new ldap.InvalidCredentialsError());
		}
		res.end();
		return next();
	});

	app.add(SUFFIX, function(req, res, next) {
		var dn = req.dn.toString();
		if (db[dn]) {
			return next(new ldap.EntryAlreadyExistsError(dn));
		}
		db[dn] = req.toObject().attributes;
		res.end();
		return next();
	});

	app.del(SUFFIX, function(req, res, next) {
		var dn = req.dn.toString();
		if (!db[dn]) {
			return next(new ldap.NoSuchObjectError(dn));
		}
		delete db[dn];
		res.end();
		return next();
	});
})();
