var http = require('http');
var express = require('express');
var api = require('./routes/api');
var privateAPI = require('./routes/api-private');
var client = require('./routes/index');
var gts = require('./routes/gtsexport');
var js = require('./routes/javascript');
var monitor = require('./routes/monitor');
var passport = require('./routes/passport');
var path = require('path');
var file = require('./routes/file');

var utilFs = require('./util/fs');
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
    app.use(express.bodyParser({ uploadDir: uploadDir }));

    app.use(express.cookieParser(CONFIG.cookie.secret));

    app.use(express.methodOverride());
    app.use(express.session());
    app.use(passport.passport.initialize());
    app.use(passport.passport.session());

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(express.logger('dev'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

app.post('/api/1.0', api.httpHandler);
app.post('/api/1.0/private', privateAPI.httpHandler);
app.get('/', client.index);
app.get('/page/:id', client.index);
app.get('/tag/:t', client.index);
app.get('/new/:projectId', client.newcase);
app.get('/project/new', client.newproject);
app.get('/project/:id/edit', client.newproject);
app.get('/case/:id', client.caseview);
app.get('/case/:id/history', client.historyList);
app.get('/case/:id/history/:history', client.history);
app.post('/export.*', client.exporter);
app.get('/case/:id/export/:type/node/:n', gts.exporter);
app.get('/javascripts/config.js', js.config);

app.get('/auth/twitter', passport.passport.authenticate('twitter'), function (req, res) {
});
app.get('/auth/twitter/callback', passport.passport.authenticate('twitter', { failureRedirect: '/' }), client.login_twitter);

app.get('/auth/facebook', passport.passport.authenticate('facebook'), function (req, res) {
});

app.get('/auth/facebook/callback', passport.passport.authenticate('facebook', { failureRedirect: '/' }), client.login_facebook);

app.post('/login', client.login);
app.post('/logout', client.logout);

app.post('/file', file.upload);
app.get('/file/:id/:fileName', file.download);

app.get('/monitor/:id', monitor.show);

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}

