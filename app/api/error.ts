export class RPCError {
	constructor(public code: number, public message: string, public data: any) {}
}

export class ParseError extends RPCError {
	constructor(msg: string, data: any) {
		super(-32700, 'Parse error: ' + msg, data);
	}
}

export class InvalidRequestError extends RPCError {
	constructor(msg: string, data: any) {
		super(-32600, 'Invalid Request: ' + msg, data);
	}
}
export class MethodNotFoundError extends RPCError {
	constructor(msg: string, data: any) {
		super(-32601, 'Method not found: ' + msg, data);
	}
}
export class InvalidParamsError extends RPCError {
	constructor(msg: string, data: any) {
		super(-32602, 'Invalid params: ' + msg, data);
	}
}
export class InternalError extends RPCError {
	constructor(msg: string, data: any) {
		super(-32603, 'Internal error: ' + msg, data);
	}
}
