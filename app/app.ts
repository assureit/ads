///<reference path='DefinitelyTyped/node/node.d.ts'/>
///<reference path='DefinitelyTyped/express/express.d.ts'/>

import http = module('http')
import express = module('express')
import api = module('./routes/api')
import client = module('./routes/index')
import path = module('path')

var app = exports.app = <Express> express();

// all environments
app.configure(function() {
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
app.get('/', client.index);
app.get('/page/:id', client.index);
app.get('/new', client.index);
app.get('/dcase/:id', client.index);
app.post('/export', client.exporter);

if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}
