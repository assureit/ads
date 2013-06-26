var http = require('http')
var error = require('../api/error')
var querystring = require('querystring')
function _getByteLength(str) {
    return querystring.unescape(encodeURIComponent(str)).length;
}
var Request = (function () {
    function Request(options) {
        this.options = options;
        this._initOptions();
    }
    Request.prototype._initOptions = function () {
        this.options = this.options || {
        };
        this.options.headers = this.options.headers || {
        };
        this.options.method = this.options.method || 'GET';
        this.options.path = this.options.path || 'GET';
    };
    Request.prototype.setHeader = function (name, value2) {
        this.options.headers[name] = value2;
    };
    Request.prototype.setMethod = function (method) {
        this.options.method = method;
    };
    Request.prototype.setContentType = function (contentType) {
        this.setHeader('Content-Type', contentType);
    };
    Request.prototype.post = function (path, data, callback) {
        this.setMethod('POST');
        this._send(path, data, callback);
    };
    Request.prototype._send = function (path, data, callback) {
        if(!this.options.host) {
            callback(new error.InternalError('host configuration is not found', null), null);
            return;
        }
        this.options.path = path;
        console.log(this.options);
        var req = http.request(this.options, function (res) {
            if(res.statusCode != 200 && res.statusCode != 201) {
                callback(new error.InternalError('Failed to access: ' + res.statusCode, res), null);
                return;
            }
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function (event) {
                console.log(body);
                callback(null, body);
            });
        });
        req.on('error', function (err) {
            callback(err, null);
        });
        req.write(data);
        req.end();
    };
    return Request;
})();
exports.Request = Request;
