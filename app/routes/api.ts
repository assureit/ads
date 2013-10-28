import jsonrpc = module('../api/jsonrpc')
import type = module('../api/type')
import dcase = module('../api/dcase')
import project = module('../api/project')
import rec = module('../api/rec')
import user = module('../api/user')
import dscript = module('../api/dscript')

jsonrpc.add('version', function(params: any, userId: number, callback: type.Callback) {
	callback.onSuccess('version 1.0');
});

jsonrpc.addModule(dcase);
jsonrpc.addModule(project);
jsonrpc.addModule(rec);
jsonrpc.addModule(user);
jsonrpc.addModule(dscript);
jsonrpc.requireAuth(['createDCase', 'commit', 'editDCase', 'deleteDCase', 'createProject', 'editProject', 'deleteProject', 'getDScript']);

export var httpHandler = jsonrpc.httpHandler;
