///<reference path='../DefinitelyTyped/node/node.d.ts'/>

import http = module('http')
import error = module('../api/error')
import url = module('url')
var CONFIG = require('config');

interface Callback {
	(err:any, result:any): void;
}
export class Redmine {
	// constructor(public host:string, public apiKey:string) {}

	_resolvePath(path:string): string {
		if (CONFIG.redmine.basePath) {
			if (!CONFIG.redmine.basePath.match(/\/$/)) CONFIG.redmine.basePath = CONFIG.redmine.basePath + '/';
			while (path.match(/^\//)) {
				path = path.substr(1);
			}
			path = url.resolve(CONFIG.redmine.basePath, path);
		}
		return path;
	}

	post(path:string, params:any, callback:Callback) {
		if (!CONFIG.redmine.host || !CONFIG.redmine.apiKey) {
			callback(new error.InternalError('Redmine host or api key configuration is not found', null), null);
		}

		var jsonParams = JSON.stringify(params);

		var options = {
			host: CONFIG.redmine.host,
			path: this._resolvePath(path),
			port: CONFIG.redmine.port,

			method: 'POST',
			headers: {
				// 'Content-Length': jsonParams.length,
				'Content-Type': 'application/json',
				'X-Redmine-API-Key': CONFIG.redmine.apiKey
			}
		};
		var req = http.request(options, (res) => {
			if (res.statusCode != 200 && res.statusCode != 201) {
				callback(new error.InternalError('Failed to access redmine: ' + res.statusCode, res), null);
				return ;
			}

			res.setEncoding('utf8');

			var body = "";
			res.on('data', (chunk: string) => {
				body += chunk;
			});

			res.on('end', (event:any) => {
				callback(null, JSON.parse(body));
			});
		});

		req.on('error', (err:any) => {
			callback(err, null);
		});

		req.write(jsonParams);
		req.end();
	}
}

export class Issue extends Redmine {
	// constructor(host:string, apiKey:string) {super(host, apiKey);}

	createSimple(title:string, body:string, callback:Callback) {
		super.post('issues.json', {
				issue: {
					project_id: CONFIG.redmine.projectId,
					// tracker_id
					// status_id: '新規',
					// category_id
					// fixed_version_id - ID of the Target Versions (previously called 'Fixed Version' and still referred to as such in the API)
					// assigned_to_id - ID of the user to assign the issue to (currently no mechanism to assign by name)
					// parent_issue_id - ID of the parent issue
					// custom_fields - See Custom fields
					// watcher_user_ids - Array of user ids to add as watchers (since 2.3.0)
					subject: title,
					description: body
				}
			},
			callback);
	}
}