///<reference path='../DefinitelyTyped/node/node.d.ts'/>

import http = module('http')
import error = module('../api/error')
import url = module('url')
import rest = module('./rest')
var CONFIG = require('config');

interface Callback {
	(err:any, result:any): void;
}
export class RecInterface {

	_resolvePath(path:string): string {
		if (CONFIG.rec.basePath) {
			if (!CONFIG.rec.basePath.match(/\/$/)) CONFIG.rec.basePath = CONFIG.rec.basePath + '/';
			while (path.match(/^\//)) {
				path = path.substr(1);
			}
			path = url.resolve(CONFIG.rec.basePath, path);
		}
		return path;
	}

	post(path:string, params:any, callback:Callback) {
		var jsonParams = JSON.stringify(params);
		try {
			var req = this._buildRequest();
			req.post(this._resolvePath(path), jsonParams, (err:any, result:string) => {
				if (err) {
					callback(err, null);
					return;
				}
				callback(null, JSON.parse(result));
			});
		} catch (e) {
			callback(e, null);
		}
	}

	put(path:string, params:any, callback:Callback) {
		var jsonParams = JSON.stringify(params);
		try {
			var req = this._buildRequest();
			req.put(this._resolvePath(path), jsonParams, (err:any, result:string) => {
				if (err) {
					callback(err, null);
					return;
				}
				callback(null, result);
			});
		} catch (e) {
			callback(e, null);
		}
	}

	_buildRequest(): rest.Request {
		if (!CONFIG.rec.host ) {
			throw new error.InternalError('REC host is not found', null);
		}
		var options = {
			host: CONFIG.rec.host,
			port: CONFIG.rec.port,
		};

		var req = new rest.Request(options);
		req.setContentType('application/json');
		return req;
	}
}

export class Rec extends RecInterface {
	// constructor(host:string, apiKey:string) {super(host, apiKey);}

	request(method: string, params: any , id: number,  callback:Callback) {
		super.post('/rec/api/1.0',{	"jsonrpc": "1.0",
						"method": method,
						"params": JSON.stringify(params),
						"id": id
					},
			callback);
	}

}
