///<reference path='../DefinitelyTyped/node/node.d.ts'/>
import childProcess = module('child_process')
import fs           = module('fs')
import lang = module('./lang')
//import ex = module('./exporter')

export var index = function(req: any, res: any) {
	//if(req.cookies.userId !== null) {
	//	res.render('signin', {title: 'Assurance DS', lang: lang.lang.ja });
	//}else {
	res.cookie('userId','1');
	res.cookie('userName','System');
	var params = {title: 'Assurance DS', lang: lang.lang.ja, userName: 'System' };
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

	if(type == "png") {
		mime = "image/png";
	}
	if(type == "pdf") {
		mime = "application/pdf";
	}
	if(type == "svg") {
		res.set('Content-type','image/svg+xml');
		res.send(req.body.svg);
		process.exit();
	}

	exec("/bin/mktemp -q /tmp/svg.XXXXXX", (error, stdout, stderr) => {
		var filename :string = stdout;
		var svgname  :string = filename;
		var resname = filename + "." + type;
		fs.writeFile(svgname, req.body.svg, (err) => {
			if (err) throw err;
			var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
			exec(rsvg_convert, (error, stdout, stderr) => {
				if(error) throw error;
				var stat = fs.statSync(resname);
				res.set("Content-Length", stat.size);
				res.set("Content-type", mime);

				res.send(fs.readFileSync(resname, "rb"));
			});
		});
	});

};
