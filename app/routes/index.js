var childProcess = require('child_process')
var fs = require('fs')
var lang = require('./lang')
exports.index = function (req, res) {
    res.cookie('userId', '1');
    res.cookie('userName', 'System');
    var params = {
        title: 'Assurance DS',
        lang: lang.lang.ja,
        userName: 'System'
    };
    if(req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
    }
    res.render('signout', params);
};
exports.exporter = function (req, res) {
    var exec = childProcess.exec;
    var type = req.body.type;
    var mime = "text/plain";
    res.set('Content-type', 'application/octet-stream; charset=utf-8');
    switch(type) {
        case "png":
            mime = "image/png";
            break;
        case "pdf":
            mime = "application/pdf";
            break;
        case "svg":
            res.set('Content-type', 'image/svg+xml');
            res.send(req.body.svg);
            return;
        case "json":
            res.send(req.body.json);
            return;
        default:
            res.send(400, "Bad Request");
            return;
    }
    exec("/bin/mktemp -q /tmp/svg.XXXXXX", function (error, stdout, stderr) {
        var filename = stdout;
        var svgname = filename.trim();
        var resname = filename.trim() + "." + type;
        fs.writeFile(svgname, req.body.svg, function (err) {
            if(err) {
                throw err;
            }
            var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
            exec(rsvg_convert, function (r_error, r_stdout, r_stderr) {
                if(r_error) {
                    throw r_error;
                }
                var stat = fs.statSync(resname);
                res.set("Content-Length", stat.size);
                res.set("Content-type", mime);
                res.send(fs.readFileSync(resname));
            });
        });
    });
};
