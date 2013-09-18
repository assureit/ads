///<reference path='DefinitelyTyped/node/node.d.ts'/>
///<reference path='DefinitelyTyped/express/express.d.ts'/>

import http = module('http')
import express = module('express')
import api = module('./routes/api')
import privateAPI = module('./routes/api-private')
import client = module('./routes/index')
import gts = module('./routes/gtsexport')
import js = module('./routes/javascript')
import monitor = module('./routes/monitor')
import passport = module('./routes/passport');
import path = module('path')
import file = module('./routes/file')
import constant = module('./constant')
import utilFs = module('./util/fs')
var CONFIG = require('config');

var app = exports.app = <Express> express();

// all environments
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	var uploadDir = path.join(__dirname, CONFIG.ads.uploadPath);
	console.log(uploadDir);
	utilFs.mkdirpSync(uploadDir);
	app.use(express.bodyParser({uploadDir: uploadDir}));
	// app.use(express.bodyParser({uploadDir:'./upload'}));
	app.use(express.cookieParser(CONFIG.cookie.secret));
//	app.use(express.cookieSession());
	app.use(express.methodOverride());
	app.use(express.session());
	app.use(passport.passport.initialize());
	app.use(passport.passport.session());
	// app.use(function(req, res, next) {
	//     console.log([
	//       req.headers['x-forwarded-for'] || req.client.remoteAddress,
	//       new Date().toLocaleString(),
	//       req.method,
	//       req.url,
	//       res.statusCode,
	//       req.headers.referer || '-',
	//       // req.headers['user-agent'] || '-'
	//       ].join('\t')
	//     );
	//     next();
	// });
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	app.use(express.logger('dev'));
})

// development only
app.configure('development', function() {
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// production only
app.configure('production', function() {
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

app.get('/auth/twitter',
  passport.passport.authenticate('twitter'),
  function(req, res) {}
);
app.get('/auth/twitter/callback',
  passport.passport.authenticate('twitter', {failureRedirect: '/' }),
  client.login_twitter
);

app.get('/auth/facebook',
  passport.passport.authenticate('facebook'),
  function(req, res) {}
);

app.get('/auth/facebook/callback',
  passport.passport.authenticate('facebook', { failureRedirect: '/' }),
  client.login_facebook
);

app.post('/login', client.login);
app.post('/logout', client.logout);
//app.post('/register', client.register);

app.post('/file', file.upload);
app.get('/file/:id/:fileName', file.download);

app.get('/monitor/:id', monitor.show);

if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}
