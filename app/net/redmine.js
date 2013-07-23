var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var error = require('../api/error');
var url = require('url');
var rest = require('./rest');
var CONFIG = require('config');

var Redmine = (function () {
    function Redmine() {
    }
    Redmine.prototype._resolvePath = function (path) {
        if (CONFIG.redmine.basePath) {
            if (!CONFIG.redmine.basePath.match(/\/$/))
                CONFIG.redmine.basePath = CONFIG.redmine.basePath + '/';
            while (path.match(/^\//)) {
                path = path.substr(1);
            }
            path = url.resolve(CONFIG.redmine.basePath, path);
        }
        return path;
    };

    Redmine.prototype.post = function (path, params, callback) {
        var jsonParams = JSON.stringify(params);
        try  {
            var req = this._buildRequest();
            req.post(this._resolvePath(path), jsonParams, function (err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, JSON.parse(result));
            });
        } catch (e) {
            callback(e, null);
        }
    };

    Redmine.prototype.put = function (path, params, callback) {
        var jsonParams = JSON.stringify(params);
        try  {
            var req = this._buildRequest();
            req.put(this._resolvePath(path), jsonParams, function (err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, result);
            });
        } catch (e) {
            callback(e, null);
        }
    };

    Redmine.prototype._buildRequest = function () {
        if (!CONFIG.redmine.host || !CONFIG.redmine.apiKey) {
            throw new error.InternalError('Redmine host or api key configuration is not found', null);
        }
        var options = {
            host: CONFIG.redmine.host,
            port: CONFIG.redmine.port
        };

        var req = new rest.Request(options);
        req.setContentType('application/json');
        req.setHeader('X-Redmine-API-Key', CONFIG.redmine.apiKey);
        return req;
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

    Issue.prototype.addComment = function (itsId, comment, callback) {
        _super.prototype.put.call(this, 'issues/' + itsId + '.json', {
            issue: {
                notes: comment
            }
        }, callback);
    };
    return Issue;
})(Redmine);
exports.Issue = Issue;

