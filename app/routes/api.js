var jsonrpc = require('../api/jsonrpc')

var dcase = require('../api/dcase')
jsonrpc.add('version', function (params, callback) {
    callback.onSuccess('version 1.0');
});
for(var fn in dcase) {
    if(typeof dcase[fn] === 'function') {
        jsonrpc.add(fn, dcase[fn]);
    }
}
exports.httpHandler = jsonrpc.httpHandler;
