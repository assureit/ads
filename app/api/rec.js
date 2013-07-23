


var rec = require('../net/rec');
var error = require('./error');

function getRawItemList(params, userId, callback) {
    var method = "getRawItemList";

    function validate(params) {
        var checks = [];
        var cnt = 0;
        var key;
        for (key in params) {
            cnt++;
        }

        if (params && !params.datatype)
            checks.push('Datatype is required when a parameter exists.');
        if (params && cnt > 1)
            checks.push('The unexpected parameter is specified.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }

    if (!validate(params))
        return;

    var rc = new rec.Rec();
    rc.request(method, params, function (err, result) {
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess(result);
    });
}
exports.getRawItemList = getRawItemList;

function getPresetList(params, userId, callback) {
    var method = "getPresetList";

    function validate(params) {
        var checks = [];
        if (params)
            checks.push('Do not specify the parameter.');

        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }

    if (!validate(params))
        return;

    var rc = new rec.Rec();
    rc.request(method, params, function (err, result) {
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess(result);
    });
}
exports.getPresetList = getPresetList;

