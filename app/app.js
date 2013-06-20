var http = require('http')
var express = require('express')
var api = require('./routes/api')
var client = require('./routes/index')
var path = require('path')
var app = exports.app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
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
app.post('/export', client.exporter);
if(!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}
