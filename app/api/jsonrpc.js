
var error = require("./error")

exports.methods = {
};
function add(key, method) {
    exports.methods[key] = method;
}
exports.add = add;
function httpHandler(req, res) {
    function onError(id, statusCode, error) {
        res.send(JSON.stringify({
            jsonrpc: '2.0',
            error: error,
            id: id
        }), statusCode);
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
    try  {
        method(req.body.params, {
            onSuccess: function (result) {
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                    result: result,
                    error: null,
                    id: req.body.id
                }), 200);
            },
            onFailure: function (error) {
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
exports.httpHandler = httpHandler;
add('ping', function (params, callback) {
    callback.onSuccess('ok');
});
