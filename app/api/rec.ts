
import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import rec = module('../net/rec')
import error = module('./error')

export function getRawItemList(params:any, userId:number, callback: type.Callback) {
	var method = "getRawItemList";

	var rc = new rec.Rec();
	rc.request(method, params, (err:any, result:any) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess(result);
	});
}

export function getPresetList(params:any, userId:number, callback: type.Callback) {
	var method = "getPresetList";

	var rc = new rec.Rec();
	rc.request(method, params, (err:any, result:any) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess(result);
	});
}
