import fs = module('fs');
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
