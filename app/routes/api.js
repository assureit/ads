var jsonrpc = require('../api/jsonrpc');

var dcase = require('../api/dcase');
var project = require('../api/project');
var rec = require('../api/rec');
var user = require('../api/user');
var dscript = require('../api/dscript');

jsonrpc.add('version', function (params, userId, callback) {
    callback.onSuccess('version 1.0');
});

jsonrpc.addModule(dcase);
jsonrpc.addModule(project);
jsonrpc.addModule(rec);
jsonrpc.addModule(user);
jsonrpc.addModule(dscript);
jsonrpc.requireAuth(['createDCase', 'commit', 'editDCase', 'deleteDCase', 'createProject', 'editProject', 'deleteProject', 'getDScript']);

exports.httpHandler = jsonrpc.httpHandler;

