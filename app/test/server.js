;
(function () {
    var express = require('express');
    var app = exports.app = express();

    var CONFIG = require('config');

    var redmineRequestBody;
    var recRequestBody;
    var responseOK = true;

    app.use(express.bodyParser());
    app.post('/rec/api/1.0', function (req, res) {
        res.header('Content-Type', 'application/json');
        recRequestBody = req.body;
        if (responseOK) {
            if (req.body.method == 'getRawItemList') {
                res.send(JSON.stringify({ jsonrpc: "2.0", result: { list: [{ watchID: "serverA_CPU", name: "サーバAのCPU負荷", datatype: "linux_cpu" }] }, id: 1 }));
            } else if (req.body.method == 'getPresetList') {
                res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: [{ presetID: "CPU_upper_Check", name: "CPU高負荷チェック", datatype: "linux_cpu", paramName: ["between", "reference"], normalComment: "$$0は正常に稼働しています。", errorComment: "$$0が高負荷です（$$1秒間の平均ロードアベレージが$$2以上です）" }] }, id: 1 }));
            } else {
                res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: 1 }));
            }
        } else {
            res.send(JSON.stringify({ jsonrpc: "2.0", id: 1 }), 500);
        }
    });

    app.post('/issues.json', function (req, res) {
        res.header('Content-Type', 'application/json');
        if (req.body.issue.project_id == CONFIG.redmine.projectId) {
            redmineRequestBody = req.body;
            res.send(JSON.stringify({ "issue": { "id": 1 } }));
        } else {
            res.send(JSON.stringify({ jsonrpc: "2.0", id: 1 }), 500);
        }
    });

    app.put('/issues/:itsId', function (req, res) {
        redmineRequestBody = req.body;
        res.send('', 200);
    });

    app.post('/test/post', function (req, res) {
        res.header('Content-Type', 'text/plain');
        if (responseOK) {
            res.send('post normal response');
        } else {
            res.send(500);
        }
    });

    app.put('/test/put', function (req, res) {
        res.header('Content-Type', 'text/plain');
        if (responseOK) {
            res.send('put normal response');
        } else {
            res.send(500);
        }
    });

    app.post('/test/header', function (req, res) {
        res.header('Content-Type', 'text/plain');
        res.send(req.headers.test_header);
    });

    app.put('/test/header', function (req, res) {
        res.header('Content-Type', 'text/plain');
        res.send(req.headers.test_header);
    });

    app.post('/test/contenttype', function (req, res) {
        res.header('Content-Type', 'text/plain');
        res.send(req.headers['content-type']);
    });

    app.put('/test/contenttype', function (req, res) {
        res.header('Content-Type', 'text/plain');
        res.send(req.headers['content-type']);
    });

    app.post('/test/check/post', function (req, res) {
        res.header('Content-Type', 'text/plain');
        res.send(req.method);
    });

    app.put('/test/check/put', function (req, res) {
        res.header('Content-Type', 'text/plain');
        res.send(req.method);
    });

    function setRedmineReuqestBody(body) {
        redmineRequestBody = body;
    }
    ;
    function getRedmineRequestBody() {
        return redmineRequestBody;
    }
    ;
    function setRecRequestBody(body) {
        recRequestBody = body;
    }
    ;
    function getRecRequestBody() {
        return recRequestBody;
    }
    ;
    function setResponseOK(OK) {
        responseOK = OK;
    }
    ;

    exports.setRedmineRequestBody = setRedmineReuqestBody;
    exports.getRedmineRequestBody = getRedmineRequestBody;
    exports.setRecRequestBody = setRecRequestBody;
    exports.getRecRequestBody = getRecRequestBody;
    exports.setResponseOK = setResponseOK;
})();
