var jsonrpc = require('../api/jsonrpc')

var dcase = require('../api/dcase')
jsonrpc.add('version', function (params, userId, callback) {
    callback.onSuccess('version 1.0');
});
jsonrpc.addModule(dcase);
jsonrpc.requireAuth([
    'createDCase', 
    'commit', 
    'editDCase', 
    'deleteDCase'
]);
exports.httpHandler = jsonrpc.httpHandler;
