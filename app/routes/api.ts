import jsonrpc = module('../api/jsonrpc')
import type = module('../api/type')
import dcase = module('../api/dcase')

jsonrpc.add('version', function(params: any, callback: type.Callback) {
	callback.onSuccess('version 1.0');
});

jsonrpc.addModule(dcase);

export var httpHandler = jsonrpc.httpHandler;