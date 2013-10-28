import fs = module('fs');
import type = module('./type')
import error = module('./error');


var dscriptLibrary: { [index: string]: string } = {};


function initDScriptLibrary() {
	var dscriptFileNames: string[] = fs.readdirSync('./dscript');

	for(var i: number = 0; i < dscriptFileNames.length; i++) {
		var fileName: string = dscriptFileNames[i];

		if(fileName.match(/.+\.ds/)) {
			var script: string = fs.readFileSync('./dscript/'+fileName, 'utf-8');
			dscriptLibrary[fileName.replace(/\.ds/, "")] = script;
		}
	}
}
initDScriptLibrary();

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
