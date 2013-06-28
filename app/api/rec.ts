
import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import rec = module('../net/rec')
import error = module('./error')

export function getRawItemList(params:any, callback: type.Callback) {
	var method = "getRawItemList";
	var id = 1;

	var rc = new rec.Rec();
	rc.request(method, params, id, (err:any, result:any) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess(result);
	});
}

export function getPresetList(params:any, callback: type.Callback) {
	var method = "getPresetList";
	var id = 1;

	var rc = new rec.Rec();
	rc.request(method, params, id, (err:any, result:any) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess(result);
	});
}
