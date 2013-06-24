///<reference path='DefinitelyTyped/node/node.d.ts'/>
///<reference path='DefinitelyTyped/express/express.d.ts'/>

import http = module('http')
import express = module('express')
import api = module('./routes/api')
import client = module('./routes/index')
import path = module('path')
import file = module('./routes/file')
import constant = module('./constant')
import utilFs = module('./util/fs')

var app = exports.app = <Express> express();

// all environments
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	var uploadDir = path.join(__dirname, constant.UPLOAD_DIR);
	console.log(uploadDir);
	utilFs.mkdirpSync(uploadDir);
	app.use(express.bodyParser({uploadDir: uploadDir}));
	// app.use(express.bodyParser({uploadDir:'./upload'}));
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
app.post('/export.*', client.exporter);

app.post('/file', file.upload);
app.get('/file/:id', file.download);

if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}
