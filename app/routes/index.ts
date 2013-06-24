///<reference path='../DefinitelyTyped/node/node.d.ts'/>
import childProcess = module('child_process')
import fs           = module('fs')
import lang = module('./lang')
import cons = module('../constant')
//import ex = module('./exporter')

export var index = function(req: any, res: any) {
	//if(req.cookies.userId !== null) {
	//	res.render('signin', {title: 'Assurance DS', lang: lang.lang.ja });
	//}else {
	res.cookie('userId','1');
	res.cookie('userName','System');
	var params = {basepath: cons.basepath, title: 'Assurance DS', lang: lang.lang.ja, userName: 'System' };
	if( req.cookies.lang == 'en') {
		params.lang = lang.lang.en;
	}
	res.render('signout', params);
	//}
};


export var exporter = function(req: any, res: any) {
	var exec = childProcess.exec;

	var type = req.body.type;
	var mime = "text/plain";

	res.set('Content-type','application/octet-stream; charset=utf-8');
	switch(type) {
		case "png":
			mime = "image/png";
			break;
		case "pdf":
			mime = "application/pdf";
			break;
		case "svg":
			res.set('Content-type','image/svg+xml');
			res.send(req.body.svg);
			return;
		case "json":
			res.send(req.body.json);
			return;
		default:
			res.send(400, "Bad Request");
			return;
	}

	exec("/bin/mktemp -q /tmp/svg.XXXXXX", (error, stdout, stderr) => {
		var filename :string = stdout;
		var svgname  :string = filename.trim();
		var resname = filename.trim() + "." + type;
		fs.writeFile(svgname, req.body.svg, (err) => {
			if (err) throw err;

			var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
			exec(rsvg_convert, (r_error, r_stdout, r_stderr) => {
				if(r_error) throw r_error;

				var stat = fs.statSync(resname);
				res.set("Content-Length", stat.size);
				res.set("Content-type", mime);
				res.send(fs.readFileSync(resname));
			});
		});
	});

};
