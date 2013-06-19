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
    if(type == "png") {
        mime = "image/png";
    }
    if(type == "pdf") {
        mime = "application/pdf";
    }
    if(type == "svg") {
        res.set('Content-type', 'image/svg+xml');
        res.send(req.body.svg);
        process.exit();
    }
    exec("/bin/mktemp -q /tmp/svg.XXXXXX", function (error, stdout, stderr) {
        var filename = stdout;
        var svgname = filename;
        var resname = filename + "." + type;
        fs.writeFile(svgname, req.body.svg, function (err) {
            if(err) {
                throw err;
            }
            var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
            exec(rsvg_convert, function (error, stdout, stderr) {
                if(error) {
                    throw error;
                }
                var stat = fs.statSync(resname);
                res.set("Content-Length", stat.size);
                res.set("Content-type", mime);
                res.send(fs.readFileSync(resname, "rb"));
            });
        });
    });
};
