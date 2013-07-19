
var error = require("./error")

var domain = require('domain')
var constant = require('../constant')
var util_auth = require('../util/auth')
var _ = require('underscore');
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
var authMethods = [];
function requireAuth(newAuthMethods) {
    authMethods = authMethods.concat(newAuthMethods);
}
exports.requireAuth = requireAuth;
function isAuthRequired(methodName) {
    return _.contains(authMethods, methodName);
}
function httpHandler(req, res) {
    var auth = new util_auth.Auth(req, res);
    function onError(id, statusCode, error) {
        res.send(JSON.stringify({
            jsonrpc: '2.0',
            error: error.toStrictRPCError(),
            id: id
        }), error.rpcHttpStatus);
    }
    function getUserId() {
        var userId = auth.getUserId();
        if(!userId) {
            userId = constant.SYSTEM_USER_ID;
        }
        return userId;
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
    if(isAuthRequired(req.body.method) && !auth.isLogin()) {
        onError(req.body.id, 200, new error.UnauthorizedError('You have to login before processing ' + method, null));
        return;
    }
    var d = domain.create();
    d.on('error', function (err) {
        onError(req.body.id, 500, new error.InternalError('Execution error is occured', JSON.stringify(err)));
    });
    d.run(function () {
        method(req.body.params, getUserId(), {
            onSuccess: function (result) {
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                    result: result,
                    error: null,
                    id: req.body.id
                }), 200);
            },
            onFailure: function (err) {
                if(!(err instanceof error.RPCError || err instanceof error.ApplicationError)) {
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
add('ping', function (params, userId, callback) {
    callback.onSuccess('ok');
});
add('ping2', function (params, userId, callback) {
    callback.onSuccess(userId);
});
