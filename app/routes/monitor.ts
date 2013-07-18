import constant = module('../constant')
import error = module('../api/error')
var CONFIG = require('config');

export var show = function(req: any, res: any){

	function validate(req:any, res: any) {
		var checks = [];
		if (!req.params) checks.push('Parameter is required.');
		if (req.params && !req.params.id) checks.push('Id is required.');
		if (req.params && req.params.id && !isFinite(req.params.id)) checks.push('Id must be a number.');

		if (checks.length > 0) {
			var msg = checks.join('\n');
			res.send(msg, error.HTTP_STATUS.BAD_REQUEST);
			return false;
		}

		return true;	
	}

	if (!validate(req, res)) return;

	if (!CONFIG.rec.monitorUrl) {
		res.send('rec.monitorUrl is not set.', error.HTTP_STATUS.INTERNAL_SERVER_ERROR);
		return;
	}
	var url = CONFIG.rec.monitorUrl.replace('$1', req.params.id);
	res.redirect(url);

}

