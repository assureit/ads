///<reference path='../DefinitelyTyped/express/express.d.ts'/>
/**
 * JSON-RPC2実装
 *
 * usage:
 * 
 */
import express = module("express")
import error = module("./error")
import type = module('./type')

export var methods: {[key: string]: type.Method;} = {};
export function add(key:string, method: type.Method) {
	methods[key] = method;
}

/**
 * handle method call
 */
export function httpHandler(req: any, res: any) {
	function onError(id: any, statusCode: number, error: error.RPCError) : void {
		res.send(JSON.stringify({
			jsonrpc: '2.0',
			error: error,
			id: id
			}), statusCode);
	}


	res.header('Content-Type', 'application/json');

	if (req.body.jsonrpc !== '2.0') {
		onError(req.body.id, 400, new error.InvalidRequestError('JSON RPC version is invalid or missiong', null));
		return;
	}
	var method: type.Method =  methods[req.body.method];
	if (!method) {
		onError(req.body.id, 404, new error.MethodNotFoundError(req.body.method, null));
		return;
	}

	try {
		method(req.body.params, {
			onSuccess: function(result: any) {
				res.send(JSON.stringify({
					jsonrpc: '2.0',
					result: result,
					error: null,
					id: req.body.id
					}), 200);
			},
			onFailure: function(error: error.RPCError) {
					res.send(JSON.stringify({
						jsonrpc: '2.0',
						error: error,
						id: req.body.id
						}), 500);
			}
		});
	} catch (e) {
		onError(req.body.id, 500, new error.InternalError('Execution error is occured', null));
	}
	return;
}

// default api
add('ping', function(params: any, callback: type.Callback) {
	callback.onSuccess('ok');
});
