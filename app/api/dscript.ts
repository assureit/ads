import fs = module('fs');
import child_process = module('child_process');
import type = module('./type')
import error = module('./error');
var CONFIG = require('config');

var dscriptLibrary: { [index: string]: string } = {};

function initDScriptLibrary(libraryPath: string) {
	var dscriptFileNames: string[] = fs.readdirSync(libraryPath);

	for(var i: number = 0; i < dscriptFileNames.length; i++) {
		var fileName: string = dscriptFileNames[i];

		if(fileName.match(/.+\.ds/)) {
			var script: string = fs.readFileSync(libraryPath+'/'+fileName, 'utf-8');
			dscriptLibrary[fileName.replace(/\.ds/, "")] = script;
		}
	}
}
if(CONFIG.dscript.libraryPath != "") {
	initDScriptLibrary(CONFIG.dscript.libraryPath);
}

export function getDScript(params: any, userId: number, callback: type.Callback) {
	function validate(params: any): boolean {
		var checks = [];
		if(!params) checks.push('Parameter is required.');
		if(params && !params.funcName) checks.push('Function name is required.');
		if(checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
		}
		return true;
	}
	if(!validate(params)) return;

	if(params.funcName in dscriptLibrary) {
		callback.onSuccess({ script: dscriptLibrary[params.funcName] });
	}
	else {
		callback.onFailure(new error.NotFoundError('Effective DScript does not exist'));
	}
}

/**************************************************************************************/

function ensureDir(path: string) {
	try {
		fs.statSync(path);
	}
	catch(e) {
		fs.mkdirSync(path);
	}
}
var status = {
	DScriptRootDir : "/tmp/dscript-v2/",
	DScriptExecDir : "/tmp/dscript-v2/" + process.pid + "/",
	Child : null,
};

function execDScriptOnGreenTea(script: string) {
	var execFile: string = status.DScriptExecDir + "dscript.ds";
	fs.writeFileSync(execFile, script);
	if (status.Child != null) {
		console.log("DScript: kill child process which starts before");
		(<any>status.Child).kill();
	}
	var command = "greentea " + execFile;
	console.log("DScript: start new child process \"" + command + "\"");
	var child = child_process.exec(command, null, function(error, stdout, stderr) {
		// do nothing
	});
	child.stdout.on('data', function(chunk: string) {
		console.log(chunk);   // for debug
	});
	child.stderr.on('data', function(chunk: string) {
		console.log(chunk);   // for debug
	});
	status.Child = child;
}
function execDScriptOnErlang(script: string) {
	var execFile: string = status.DScriptExecDir + "dscript.erl";
	fs.writeFileSync(execFile, script);
	if (status.Child != null) {
		console.log("DScript: kill child process which starts before");
		(<any>status.Child).kill();
	}

	var compile_command = "erlc -o " + status.DScriptExecDir + " " + execFile;
	var execute_command = "erl -pa " + status.DScriptExecDir + " -noshell -run dscript main -run -init stop";
	var command = compile_command + " && " + execute_command;
	console.log("DScript: start new child process \"" + command + "\"");
	var child = child_process.exec(command, null, function(error, stdout, stderr) {
		// do nothing
	});
	child.stdout.on('data', function(chunk: string) {
		console.log(chunk);   // for debug
	});
	child.stderr.on('data', function(chunk: string) {
		console.log(chunk);   // for debug
	});
	status.Child = child;
}
export function execDScript(params: any, userId: number, callback: type.Callback) {
	function validate(params: any): boolean {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.lang) checks.push('Langage is required.');
		if (params && !params.script) checks.push('Script is required.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
		}
		return true;
	}
	if (!validate(params)) return;

	ensureDir(status.DScriptRootDir);
	ensureDir(status.DScriptExecDir);
	if (params.lang == "greentea") {
		execDScriptOnGreenTea(params.script);
		callback.onSuccess({});
	}
	else if (params.lang == "erlang") {
		execDScriptOnErlang(params.script);
		callback.onSuccess({});
	}
	else {
		callback.onFailure(new error.InvalidParamsError(['invalid Language.'], null));
	}
}
