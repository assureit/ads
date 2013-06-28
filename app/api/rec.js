


var rec = require('../net/rec')

function getRawItemList(params, callback) {
    var method = "getRawItemList";
    var rc = new rec.Rec();
    rc.request(method, params, function (err, result) {
        if(err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess(result);
    });
}
exports.getRawItemList = getRawItemList;
function getPresetList(params, callback) {
    var method = "getPresetList";
    var rc = new rec.Rec();
    rc.request(method, params, function (err, result) {
        if(err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess(result);
    });
}
exports.getPresetList = getPresetList;
