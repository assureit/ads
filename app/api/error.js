var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RPCError = (function () {
    function RPCError(rpcHttpStatus, code, message, data) {
        this.rpcHttpStatus = rpcHttpStatus;
        this.code = code;
        this.message = message;
        this.data = data;
    }
    RPCError.prototype.toStrictRPCError = function () {
        return {
            code: this.code,
            message: this.message
        };
    };
    return RPCError;
})();
exports.RPCError = RPCError;
var ParseError = (function (_super) {
    __extends(ParseError, _super);
    function ParseError(msg, data) {
        _super.call(this, HTTP_STATUS.INTERNAL_SERVER_ERROR, RPC_ERROR.PARSE_ERROR, 'Parse error: ' + msg, data);
    }
    return ParseError;
})(RPCError);
exports.ParseError = ParseError;
var InvalidRequestError = (function (_super) {
    __extends(InvalidRequestError, _super);
    function InvalidRequestError(msg, data) {
        _super.call(this, HTTP_STATUS.BAD_REQUEST, -32600, 'Invalid Request: ' + msg, data);
    }
    return InvalidRequestError;
})(RPCError);
exports.InvalidRequestError = InvalidRequestError;
var MethodNotFoundError = (function (_super) {
    __extends(MethodNotFoundError, _super);
    function MethodNotFoundError(msg, data) {
        _super.call(this, HTTP_STATUS.NOT_FOUND, -32601, 'Method not found: ' + msg, data);
    }
    return MethodNotFoundError;
})(RPCError);
exports.MethodNotFoundError = MethodNotFoundError;
var InvalidParamsError = (function (_super) {
    __extends(InvalidParamsError, _super);
    function InvalidParamsError(msg, data) {
        _super.call(this, HTTP_STATUS.INTERNAL_SERVER_ERROR, -32602, 'Invalid params: ' + msg, data);
    }
    return InvalidParamsError;
})(RPCError);
exports.InvalidParamsError = InvalidParamsError;
var InternalError = (function (_super) {
    __extends(InternalError, _super);
    function InternalError(msg, data) {
        _super.call(this, HTTP_STATUS.INTERNAL_SERVER_ERROR, -32603, 'Internal error: ' + msg, data);
    }
    return InternalError;
})(RPCError);
exports.InternalError = InternalError;
var ApplicationError = (function () {
    function ApplicationError(rpcHttpStatus, code, message, data) {
        this.rpcHttpStatus = rpcHttpStatus;
        this.code = code;
        this.message = message;
        this.data = data;
    }
    ApplicationError.prototype.toStrictRPCError = function () {
        return {
            code: this.code,
            message: this.message
        };
    };
    return ApplicationError;
})();
exports.ApplicationError = ApplicationError;
var NotFoundError = (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(msg, data) {
        _super.call(this, HTTP_STATUS.OK, RPC_ERROR.NOT_DEFINED, msg, data);
    }
    return NotFoundError;
})(ApplicationError);
exports.NotFoundError = NotFoundError;
var DuplicatedError = (function (_super) {
    __extends(DuplicatedError, _super);
    function DuplicatedError(msg, data) {
        _super.call(this, HTTP_STATUS.OK, RPC_ERROR.NOT_DEFINED, msg, data);
    }
    return DuplicatedError;
})(ApplicationError);
exports.DuplicatedError = DuplicatedError;
var RPC_ERROR;
(function (RPC_ERROR) {
    RPC_ERROR._map = [];
    RPC_ERROR.INVALID_REQUEST = -32600;
    RPC_ERROR.METHOD_NOT_FOUND = -32601;
    RPC_ERROR.INVALID_PARAMS = -32602;
    RPC_ERROR.INTERNAL_ERROR = -32603;
    RPC_ERROR.PARSE_ERROR = -32700;
    RPC_ERROR.NOT_DEFINED = 19999;
})(RPC_ERROR || (RPC_ERROR = {}));
var HTTP_STATUS;
(function (HTTP_STATUS) {
    HTTP_STATUS._map = [];
    HTTP_STATUS.OK = 200;
    HTTP_STATUS.BAD_REQUEST = 400;
    HTTP_STATUS.NOT_FOUND = 404;
    HTTP_STATUS.INTERNAL_SERVER_ERROR = 500;
})(HTTP_STATUS || (HTTP_STATUS = {}));
