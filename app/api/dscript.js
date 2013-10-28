var fs = require('fs');

var error = require('./error');
var CONFIG = require('config');

var dscriptLibrary = {};

function initDScriptLibrary(libraryPath) {
    var dscriptFileNames = fs.readdirSync(libraryPath);

    for (var i = 0; i < dscriptFileNames.length; i++) {
        var fileName = dscriptFileNames[i];

        if (fileName.match(/.+\.ds/)) {
            var script = fs.readFileSync(libraryPath + '/' + fileName, 'utf-8');
            dscriptLibrary[fileName.replace(/\.ds/, "")] = script;
        }
    }
}
if (CONFIG.dscript.libraryPath != "") {
    initDScriptLibrary(CONFIG.dscript.libraryPath);
}

function getDScript(params, userId, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.funcName)
            checks.push('Function name is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
        }
        return true;
    }
    if (!validate(params))
        return;

    if (params.funcName in dscriptLibrary) {
        callback.onSuccess({ script: dscriptLibrary[params.funcName] });
    } else {
        callback.onFailure(new error.NotFoundError('Effective DScript does not exist'));
    }
}
exports.getDScript = getDScript;

