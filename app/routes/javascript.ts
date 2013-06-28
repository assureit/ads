///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var CONFIG = require('config')
//import ex = module('./exporter')

export var config = function(req: any, res: any) {
	var params = {basepath: CONFIG.ads.basePath};
	res.set('Content-type','text/javascript');
	res.render('javascript/config', params);
};
