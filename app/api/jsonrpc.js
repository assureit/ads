
var error = require("./error")

var domain = require('domain')
exports.methods = {
};
function add(key, method) {
    exports.methods[key] = method;
}
exports.add = add;
function addModule(module) {
    for(var fn in module) {
        if(typeof module[fn] === 'function') {
            add(fn, module[fn]);
        }
    }
}
exports.addModule = addModule;
function httpHandler(req, res) {
    function onError(id, statusCode, error) {
        res.send(JSON.stringify({
            jsonrpc: '2.0',
            error: error.toStrictRPCError(),
            id: id
        }), error.rpcHttpStatus);
    }
    res.header('Content-Type', 'application/json');
    if(req.body.jsonrpc !== '2.0') {
        onError(req.body.id, 400, new error.InvalidRequestError('JSON RPC version is invalid or missiong', null));
        return;
    }
    var method = exports.methods[req.body.method];
    if(!method) {
        onError(req.body.id, 404, new error.MethodNotFoundError(req.body.method, null));
        return;
    }
    var d = domain.create();
    d.on('error', function (err) {
        onError(req.body.id, 500, new error.InternalError('Execution error is occured', JSON.stringify(err)));
    });
    d.run(function () {
        method(req.body.params, {
            onSuccess: function (result) {
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                    result: result,
                    error: null,
                    id: req.body.id
                }), 200);
            },
            onFailure: function (err) {
                if(!(error instanceof error.RPCError && error instanceof error.ApplicationError)) {
                    err = new error.InternalError('Execution error is occured', JSON.stringify(err));
                }
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                    error: err.toStrictRPCError(),
                    id: req.body.id
                }), err.rpcHttpStatus);
            }
        });
    });
    return;
}
exports.httpHandler = httpHandler;
add('ping', function (params, callback) {
    callback.onSuccess('ok');
});
