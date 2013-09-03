var jsonrpc = require('../api/jsonrpc');



jsonrpc.add('version', function (params, userId, callback) {
    callback.onSuccess('version 1.0');
});

exports.httpHandler = jsonrpc.httpHandler;

