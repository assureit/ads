///<reference path='DefinitelyTyped/node/node.d.ts'/>

;(() => {
//OpenLDAP Server DUMMY
var ldap = require('ldapjs');
var CONFIG = require('config');

///--- Shared handlers

function authorize(req, res, next) {
	var cn;
	req.connection.ldap.bindDN.rdns.forEach((val) => {
		if (val.cn) cn = val.cn;
	});

	if (cn !== 'root') {
		console.log('authorize error');
		return next(new ldap.InsufficientAccessRightsError());
	}
	return next();
}


///--- Globals

var rootSUFFIX = CONFIG.ldap.root;
var SUFFIX = 'ou=user,dc=assureit,dc=org';
var db = {};
var server = ldap.createServer();

server.bind(rootSUFFIX, function(req, res, next) {
	console.log('---- BIND ROOT FROM CONFIG: ' + rootSUFFIX);

	var cn;
	req.dn.rdns.forEach((val) => {
		if (val.cn) cn = val.cn;
	});

	if (cn !== 'root' || req.credentials !== CONFIG.ldap.password)
	{
		console.log('bind root error');
		return next(new ldap.InvalidCredentialsError());
	}
	console.log('---- BIND OK ----');
	res.end();
	return next();
});

server.add(SUFFIX, authorize, function(req, res, next) {
	console.log('---- CALL ADD ----');
	res.end();
	return next();
});

server.bind(SUFFIX, function(req, res, next) {
	console.log('---- CALL BIND ----');
	res.end();
	return next();
});

server.del(SUFFIX, authorize, function(req, res, next) {
	console.log('---- CALL DELETE ----');
	res.end();
	return next();
});


///--- Fire it up
server.listen(CONFIG.ldap.dummy.port, CONFIG.ldap.dummy.ip, function() {
	console.log('LDAP server up at: %s', server.url);
});








//server.compare(SUFFIX, authorize, function(req, res, next) {
//	var dn = req.dn.toString();
//	if (!db[dn])
//		return next(new ldap.NoSuchObjectError(dn));
//
//	if (!db[dn][req.attribute])
//		return next(new ldap.NoSuchAttributeError(req.attribute));
//
//	var matches = false;
//	var vals = db[dn][req.attribute];
//	for (var i = 0; i < vals.length; i++) {
//		if (vals[i] === req.value) {
//			matches = true;
//			break;
//		}
//	}
//
//	res.end(matches);
//	return next();
//});
//
//server.modify(SUFFIX, authorize, function(req, res, next) {
//	var dn = req.dn.toString();
//	if (!req.changes.length)
//		return next(new ldap.ProtocolError('changes required'));
//	if (!db[dn])
//		return next(new ldap.NoSuchObjectError(dn));
//
//	var entry = db[dn];
//	var mod;
//
//	for (var i = 0; i < req.changes.length; i++) {
//		mod = req.changes[i].modification;
//		switch (req.changes[i].operation) {
//		case 'replace':
//			if (!entry[mod.type])
//				return next(new ldap.NoSuchAttributeError(mod.type));
//
//			if (!mod.vals || !mod.vals.length) {
//				delete entry[mod.type];
//			} else {
//				entry[mod.type] = mod.vals;
//			}
//
//			break;
//
//		case 'add':
//			if (!entry[mod.type]) {
//				entry[mod.type] = mod.vals;
//			} else {
//				mod.vals.forEach(function(v) {
//					if (entry[mod.type].indexOf(v) === -1)
//						entry[mod.type].push(v);
//				});
//			}
//
//			break;
//
//		case 'delete':
//			if (!entry[mod.type])
//				return next(new ldap.NoSuchAttributeError(mod.type));
//
//			delete entry[mod.type];
//
//			break;
//		}
//	}
//
//	res.end();
//	return next();
//});
//
//server.search(SUFFIX, authorize, function(req, res, next) {
//	var dn = req.dn.toString();
//	if (!db[dn])
//		return next(new ldap.NoSuchObjectError(dn));
//
//	var scopeCheck;
//
//	switch (req.scope) {
//	case 'base':
//		if (req.filter.matches(db[dn])) {
//			res.send({
//				dn: dn,
//				attributes: db[dn]
//			});
//		}
//
//		res.end();
//		return next();
//
//	case 'one':
//		scopeCheck = function(k) {
//			if (req.dn.equals(k))
//				return true;
//
//			var parent = ldap.parseDN(k).parent();
//			return (parent ? parent.equals(req.dn) : false);
//		};
//		break;
//
//	case 'sub':
//		scopeCheck = function(k) {
//			return (req.dn.equals(k) || req.dn.parentOf(k));
//		};
//
//		break;
//	}
//
//	Object.keys(db).forEach(function(key) {
//		if (!scopeCheck(key))
//			return;
//
//		if (req.filter.matches(db[key])) {
//			res.send({
//				dn: key,
//				attributes: db[key]
//			});
//		}
//	});
//
//	res.end();
//	return next();
//});


})();