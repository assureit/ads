import http = module('http')
import error = module('../api/error')
import querystring = module('querystring')

interface Callback {
	(err:any, result:string): void;
}

export interface Option {
	host?: string;
	// path?: string;
	port?: number;
	method?: string;
	headers?: any;
	path?: string;
}

function _getByteLength(str: string):number {
	return querystring.unescape(encodeURIComponent(str)).length;
}
export class Request {
	constructor(public options?: Option) {
		this._initOptions();		
	}

	_initOptions() {
		this.options = this.options || {};
		this.options.headers = this.options.headers || {};
		this.options.method = this.options.method || 'GET';
		this.options.path = this.options.path || 'GET';
	}


	setHeader(name: string, value2: any) {
		this.options.headers[name] = value2;
	}

	setMethod(method: string) {
		this.options.method = method;
	}

	setContentType(contentType: string) {
		this.setHeader('Content-Type', contentType);
	}

	post(path: string, data:string, callback:Callback): void {
		if (!this.options.host) {
			callback(new error.InternalError('host configuration is not found', null), null);
			return;
		}
		this.setHeader('Content-Length', _getByteLength(data));
		this.setMethod('POST');
		this.options.path = path;

		console.log(this.options);

		var req = http.request(this.options, (res:any) => {
			if (res.statusCode != 200 && res.statusCode != 201) {
				callback(new error.InternalError('Failed to access: ' + res.statusCode, res), null);
				return ;
			}

			res.setEncoding('utf8');

			var body = "";
			res.on('data', (chunk: string) => {
				body += chunk;
			});

			res.on('end', (event:any) => {
				console.log('hoge');
				console.log(body);
				callback(null, body);
			});
		});

		req.on('error', (err:any) => {
			callback(err, null);
		});

		req.write(data);
		req.end();
	}

	end(err:any, result:string) {

	}
}