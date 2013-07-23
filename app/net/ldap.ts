///<reference path='../DefinitelyTyped/node/node.d.ts'/>

import error = module('../api/error')
var CONFIG = require('config');
var ldap = require('ldapjs');

export class Ldap {

	auth(loginName: string, password: string, callback: (err:any) => void) {
		var client = ldap.createClient({url: CONFIG.ldap.url});
		var dn = CONFIG.ldap.dn.replace('$1', loginName);

		client.bind(dn, password, function(err) {
			if (err) {
				console.error(err);
				callback(err);
				return;
			}
			client.unbind(function(err) {
				callback(err);
			});
		});
	}

	add(loginName: string, password: string, callback: (err:any) => void) {
		var client = ldap.createClient({url: CONFIG.ldap.url});
		var dn = CONFIG.ldap.dn.replace('$1', loginName);
		//TODO: entryの中要確認
		var entry = {
			cn: loginName,
			sn: loginName,
			objectClass: 'inetOrgPerson',
			userPassword: password 
		}

		client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function(err) {
			if (err) {
				console.error(err);
				callback(new error.ExternalParameterError('root account authority went wrong.', err));
				return;
			}

			client.add(dn, entry, function(err) {
				if (err) {
					if (err.name === 'EntryAlreadyExistsError') {
						callback(new error.LoginError('Login Name is already exist.', err));
					}
					else
					{
						callback(err);
					}
					return;
				}
				client.unbind(function(err) {
					callback(err);
				});
			});
		});
	}

	del(loginName: string, callback: (err:any) => void) {
		var client = ldap.createClient({url: CONFIG.ldap.url});
		var dn = CONFIG.ldap.dn.replace('$1', loginName);

		client.bind(CONFIG.ldap.root, CONFIG.ldap.password, function(err) {
			if (err) {
				console.error(err);
				callback(err);
				return;
			}
			client.del(dn, function(err) {
				if (err) {
					callback(err);
					return;
				}
				client.unbind(function(err) {
					callback(err);
				});
			});
		});
	}
}
