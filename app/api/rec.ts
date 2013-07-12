
import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import rec = module('../net/rec')
import error = module('./error')

export function getRawItemList(params:any, userId:number, callback: type.Callback) {
	var method = "getRawItemList";

	function validate(params:any) {
		var checks = [];
		var cnt = 0;
		var key;
		for (key in params) {cnt++;}

		if (params && !params.datatype) checks.push('Datatype is required when a parameter exists.');
		if (params && cnt > 1) checks.push('The unexpected parameter is specified.');
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

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

	function validate(params:any) {
		var checks = [];
		if (params) checks.push('Do not specify the parameter.');
		
		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var rc = new rec.Rec();
	rc.request(method, params, (err:any, result:any) => {
		if (err) {
			callback.onFailure(err);
			return;
		}
		callback.onSuccess(result);
	});
}
