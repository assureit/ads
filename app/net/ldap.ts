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
				callback(err);
				return;
			}

			client.add(dn, entry, function(err) {
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
