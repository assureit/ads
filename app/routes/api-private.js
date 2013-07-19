var jsonrpc = require('../api/jsonrpc')

var monitor = require('../api/monitor')
jsonrpc.add('version', function (params, userId, callback) {
    callback.onSuccess('version 1.0');
});
jsonrpc.addModule(monitor);
exports.httpHandler = jsonrpc.httpHandler;
