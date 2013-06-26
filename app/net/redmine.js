var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var error = require('../api/error')
var url = require('url')
var rest = require('./rest')
var CONFIG = require('config');
var Redmine = (function () {
    function Redmine() { }
    Redmine.prototype._resolvePath = function (path) {
        if(CONFIG.redmine.basePath) {
            if(!CONFIG.redmine.basePath.match(/\/$/)) {
                CONFIG.redmine.basePath = CONFIG.redmine.basePath + '/';
            }
            while(path.match(/^\//)) {
                path = path.substr(1);
            }
            path = url.resolve(CONFIG.redmine.basePath, path);
        }
        return path;
    };
    Redmine.prototype.post = function (path, params, callback) {
        if(!CONFIG.redmine.host || !CONFIG.redmine.apiKey) {
            callback(new error.InternalError('Redmine host or api key configuration is not found', null), null);
        }
        var jsonParams = JSON.stringify(params);
        var options = {
            host: CONFIG.redmine.host,
            path: this._resolvePath(path),
            port: CONFIG.redmine.port,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Redmine-API-Key': CONFIG.redmine.apiKey
            }
        };
        var client = new rest.Request(options);
        client.post(this._resolvePath(path), jsonParams, function (err, result) {
            if(err) {
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, JSON.parse(result));
        });
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
        _super.prototype.post.call(this, 'issues.json', {
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
