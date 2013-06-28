var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var error = require('../api/error')
var url = require('url')
var rest = require('./rest')
var CONFIG = require('config');
var RecInterface = (function () {
    function RecInterface() { }
    RecInterface.prototype._resolvePath = function (path) {
        if(CONFIG.rec.basePath) {
            if(!CONFIG.rec.basePath.match(/\/$/)) {
                CONFIG.rec.basePath = CONFIG.rec.basePath + '/';
            }
            while(path.match(/^\//)) {
                path = path.substr(1);
            }
            path = url.resolve(CONFIG.rec.basePath, path);
        }
        return path;
    };
    RecInterface.prototype.post = function (path, params, callback) {
        var jsonParams = JSON.stringify(params);
        try  {
            var req = this._buildRequest();
            req.post(this._resolvePath(path), jsonParams, function (err, result) {
                if(err) {
                    callback(err, null);
                    return;
                }
                callback(null, JSON.parse(result));
            });
        } catch (e) {
            callback(e, null);
        }
    };
    RecInterface.prototype.put = function (path, params, callback) {
        var jsonParams = JSON.stringify(params);
        try  {
            var req = this._buildRequest();
            req.put(this._resolvePath(path), jsonParams, function (err, result) {
                if(err) {
                    callback(err, null);
                    return;
                }
                callback(null, result);
            });
        } catch (e) {
            callback(e, null);
        }
    };
    RecInterface.prototype._buildRequest = function () {
        if(!CONFIG.rec.host) {
            throw new error.InternalError('REC host is not found', null);
        }
        var options = {
            host: CONFIG.rec.host,
            port: CONFIG.rec.port
        };
        var req = new rest.Request(options);
        req.setContentType('application/json');
        return req;
    };
    return RecInterface;
})();
exports.RecInterface = RecInterface;
var Rec = (function (_super) {
    __extends(Rec, _super);
    function Rec() {
        _super.apply(this, arguments);

    }
    Rec.prototype.request = function (method, params, id, callback) {
        _super.prototype.post.call(this, '/api/1.0', {
            "jsonrpc": "1.0",
            "method": method,
            "params": JSON.stringify(params),
            "id": id
        }, callback);
    };
    return Rec;
})(RecInterface);
exports.Rec = Rec;
