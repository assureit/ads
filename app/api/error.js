var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RPCError = (function () {
    function RPCError(code, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
    return RPCError;
})();
exports.RPCError = RPCError;
var ParseError = (function (_super) {
    __extends(ParseError, _super);
    function ParseError(msg, data) {
        _super.call(this, -32700, 'Parse error: ' + msg, data);
    }
    return ParseError;
})(RPCError);
exports.ParseError = ParseError;
var InvalidRequestError = (function (_super) {
    __extends(InvalidRequestError, _super);
    function InvalidRequestError(msg, data) {
        _super.call(this, -32600, 'Invalid Request: ' + msg, data);
    }
    return InvalidRequestError;
})(RPCError);
exports.InvalidRequestError = InvalidRequestError;
var MethodNotFoundError = (function (_super) {
    __extends(MethodNotFoundError, _super);
    function MethodNotFoundError(msg, data) {
        _super.call(this, -32601, 'Method not found: ' + msg, data);
    }
    return MethodNotFoundError;
})(RPCError);
exports.MethodNotFoundError = MethodNotFoundError;
var InvalidParamsError = (function (_super) {
    __extends(InvalidParamsError, _super);
    function InvalidParamsError(msg, data) {
        _super.call(this, -32602, 'Invalid params: ' + msg, data);
    }
    return InvalidParamsError;
})(RPCError);
exports.InvalidParamsError = InvalidParamsError;
var InternalError = (function (_super) {
    __extends(InternalError, _super);
    function InternalError(msg, data) {
        _super.call(this, -32603, 'Internal error: ' + msg, data);
    }
    return InternalError;
})(RPCError);
exports.InternalError = InternalError;
