var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var http = require('http')
var error = require('../api/error')
var CONFIG = require('config');
var Redmine = (function () {
    function Redmine() { }
    Redmine.prototype.post = function (path, params, callback) {
        if(!CONFIG.redmine.host || !CONFIG.redmine.apiKey) {
            callback(new error.InternalError('Redmine host or api key configuration is not found', null), null);
        }
        var jsonParams = JSON.stringify(params);
        var options = {
            host: CONFIG.redmine.host,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Redmine-API-Key': CONFIG.redmine.apiKey
            }
        };
        console.log(jsonParams);
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            if(res.statusCode != 200 && res.statusCode != 201) {
                callback(new error.InternalError('Failed to access redmine: ' + res.statusCode, res), null);
                return;
            }
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function (chunk) {
                console.log('1 ============');
                body += chunk;
            });
            res.on('end', function (event) {
                console.log('2 ============');
                callback(null, JSON.parse(body));
            });
        });
        req.on('error', function (err) {
            callback(err, null);
        });
        req.write(jsonParams);
        req.end();
    };
    return Redmine;
})();
exports.Redmine = Redmine;
var Issue = (function (_super) {
    __extends(Issue, _super);
    function Issue() {
        _super.apply(this, arguments);

    }
    Issue.prototype.createSimple = function (title, body, callback) {
        _super.prototype.post.call(this, '/issues.json', {
            issue: {
                project_id: CONFIG.redmine.projectId,
                subject: title,
                description: body
            }
        }, callback);
    };
    return Issue;
})(Redmine);
exports.Issue = Issue;
