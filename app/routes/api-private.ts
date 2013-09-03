import jsonrpc = module('../api/jsonrpc')
import type = module('../api/type')
import monitor = module('../api/monitor')

jsonrpc.add('version', function(params: any, userId: number, callback: type.Callback) {
	callback.onSuccess('version 1.0');
});

// jsonrpc.addModule(monitor);

export var httpHandler = jsonrpc.httpHandler;
