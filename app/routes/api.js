var jsonrpc = require('../api/jsonrpc')

var dcase = require('../api/dcase')
jsonrpc.add('version', function (params, callback) {
    callback.onSuccess('version 1.0');
});
jsonrpc.addModule(dcase);
exports.httpHandler = jsonrpc.httpHandler;
