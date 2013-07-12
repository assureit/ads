var http = require('http')
var express = require('express')
var api = require('./routes/api')
var client = require('./routes/index')
var js = require('./routes/javascript')
var path = require('path')
var file = require('./routes/file')

var utilFs = require('./util/fs')
var CONFIG = require('config');
var app = exports.app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    var uploadDir = path.join(__dirname, CONFIG.ads.uploadPath);
    console.log(uploadDir);
    utilFs.mkdirpSync(uploadDir);
    app.use(express.bodyParser({
        uploadDir: uploadDir
    }));
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.logger('dev'));
});
app.configure('development', function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});
app.configure('production', function () {
    app.use(express.errorHandler());
});
app.post('/api/1.0', api.httpHandler);
app.get('/', client.index);
app.get('/page/:id', client.index);
app.get('/new', client.index);
app.get('/dcase/:id', client.index);
app.post('/export.*', client.exporter);
app.get('/javascripts/config.js', js.config);
app.post('/login', client.login);
app.post('/logout', client.logout);
app.post('/register', client.register);
app.post('/file', file.upload);
app.get('/file/:id', file.download);
if(!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}
