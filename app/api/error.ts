export interface IRPCError {
	code: number;
	message: string;
}

export interface IRPCOverHTTPError extends IRPCError{
	rpcHttpStatus: number;
	toStrictRPCError(): IRPCError;
}

export class RPCError implements IRPCOverHTTPError{
	constructor(public rpcHttpStatus:number, public code:number, public message: string, public data?: any) {}
	toStrictRPCError(): IRPCError {
		return {
			code: this.code,
			message: this.message
		}
	}
}

export class ParseError extends RPCError {
	constructor(msg: string, data: any) {
		super(HTTP_STATUS.INTERNAL_SERVER_ERROR, RPC_ERROR.PARSE_ERROR, 'Parse error: ' + msg, data);
	}
}

export class InvalidRequestError extends RPCError {
	constructor(msg: string, data: any) {
		super(HTTP_STATUS.BAD_REQUEST, -32600, 'Invalid Request: ' + msg, data);
	}
}
export class MethodNotFoundError extends RPCError {
	constructor(msg: string, data: any) {
		super(HTTP_STATUS.NOT_FOUND, -32601, 'Method not found: ' + msg, data);
	}
}
export class InvalidParamsError extends RPCError {
	constructor(msg: string[], data: any);
	constructor(msg: string, data: any);
	constructor(msg: any, data: any) {
		if (msg instanceof Array) {
			msg = msg.join('\n');
		}
		super(HTTP_STATUS.OK, -32602, 'Invalid method parameter is found: \n' + msg, data);
	}
}
export class InternalError extends RPCError {
	constructor(msg: string, data: any) {
		super(HTTP_STATUS.INTERNAL_SERVER_ERROR, -32603, 'Internal error: ' + msg, data);
	}
}

export class ApplicationError implements IRPCOverHTTPError {
	constructor(public rpcHttpStatus:number, public code:number, public message: string, public data?: any) {}
	toStrictRPCError(): IRPCError {
		return {
			code: this.code,
			message: this.message
		}
	}
}

export class NotFoundError extends ApplicationError {
	constructor(msg:string, data?:any) {
		super(HTTP_STATUS.OK, RPC_ERROR.DATA_NOT_FOUND, msg, data);
	}
}

export class DuplicatedError extends ApplicationError {
	constructor(msg:string, data?:any) {
		super(HTTP_STATUS.OK, RPC_ERROR.NOT_DEFINED, msg, data);
	}
}

export class LoginError extends ApplicationError {
	constructor(msg:string, data?:any) {
		super(HTTP_STATUS.OK, RPC_ERROR.AUTH_ERROR, msg, data);
	}
}

export class UnauthorizedError extends ApplicationError {
	constructor(msg:string, data?:any) {
		super(HTTP_STATUS.OK, RPC_ERROR.AUTH_ERROR, msg, data);
	}
}

export class VersionConflictError extends ApplicationError {
	constructor(msg:string, data?:any) {
		super(HTTP_STATUS.OK, RPC_ERROR.DATA_VERSION_CONFLICT, msg, data);
	}
}

export class ExternalParameterError extends ApplicationError {
	constructor(msg:string, data?:any) {
		super(HTTP_STATUS.OK, RPC_ERROR.CONFIG_ERROR, msg, data);
	}
}


export enum RPC_ERROR {
	INVALID_REQUEST = -32600,
	METHOD_NOT_FOUND = -32601,
	INVALID_PARAMS = -32602,
	INTERNAL_ERROR = -32603,
	PARSE_ERROR = -32700,
	CONFIG_ERROR = 22000,
	AUTH_ERROR = 23000,
	DATA_NOT_FOUND = 24001,
	DATA_VERSION_CONFLICT = 24002,
	DATA_DUPLICATE = 24003,

	NOT_DEFINED = 19999
}

export enum HTTP_STATUS {
	OK = 200,
	BAD_REQUEST = 400, 	// Bad Request
	UNAUTHORIZED = 401,	// Unauthorized
	FORBIDDEN = 403,	// Forbidden
	NOT_FOUND = 404, 	// Not Found
	INTERNAL_SERVER_ERROR = 500 // Internal Server Error
/*
100 Continue
101 Switching Protocols
102 Processing
201 Created
202 Accepted
203 Non-Authoritative Information
204 No Content
205 Reset Content
206 Partial Content
207 Multi-Status (WebDAV; RFC 4918)
208 Already Reported (WebDAV; RFC 5842)
226 IM Used (RFC 3229)
300 Multiple Choices
301 Moved permanently
302 Found
303 See Other (since HTTP/1.1)
304 Not Modified
305 Use Proxy (since HTTP/1.1)
306 Switch Proxy|
307 Temporary Redirect (since HTTP/1.1)|
308 Permanent Redirect (approved as experimental RFC)
401 Unauthorized
402 Payment Required
403 Forbidden
405 Method Not Allowed
406 Not Acceptable
407 Proxy Authentication Required
408 Request Timeout
409 Conflict
410 Gone
411 Length Required
412 Precondition Failed
413 Request Entity Too Large
414 Request-URI Too Long
415 Unsupported Media Type
416 Requested Range Not Satisfiable
417 Expectation Failed
418 I'm a teapot (RFC 2324)
420 Enhance Your Calm (Twitter)
422 Unprocessable Entity (WebDAV; RFC 4918)
423 Locked (WebDAV; RFC 4918)
424 Failed Dependency (WebDAV; RFC 4918)
424 Method Failure (WebDAV)[14]
425 Unordered Collection (Internet draft)
426 Upgrade Required (RFC 2817)
428 Precondition Required (RFC 6585)
429 Too Many Requests (RFC 6585)
431 Request Header Fields Too Large (RFC 6585)
444 No Response (Nginx)
449 Retry With (Microsoft)
450 Blocked by Windows Parental Controls (Microsoft)
451 Unavailable For Legal Reasons (Internet draft)
451 Redirect (Microsoft)
494 Request Header Too Large (Nginx)
495 Cert Error (Nginx)
496 No Cert (Nginx)
497 HTTP to HTTPS (Nginx)
499 Client Closed Request (Nginx)
501 Not Implemented
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
505 HTTP Version Not Supported
506 Variant Also Negotiates (RFC 2295)
507 Insufficient Storage (WebDAV; RFC 4918)
508 Loop Detected (WebDAV; RFC 5842)
509 Bandwidth Limit Exceeded (Apache bw/limited extension)
510 Not Extended (RFC 2774)
511 Network Authentication Required (RFC 6585)
598 Network read timeout error (Unknown)
599 Network connect timeout error (Unknown)	
*/
}
