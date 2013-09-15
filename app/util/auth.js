var Auth = (function () {
    function Auth(req, res) {
        this.req = req;
        this.res = res;
    }
    Auth.prototype.isLogin = function () {
        return this.req.session.userId != null;
    };

    Auth.prototype.set = function (userId, userName) {
        this.req.session.userId = userId;
        this.req.session.userName = userName;
    };

    Auth.prototype.getLoginName = function () {
        return this.req.session.userName;
    };

    Auth.prototype.getUserId = function () {
        if (this.req.session.userId)
            return parseInt(this.req.session.sessionId, 10);
        return undefined;
    };

    Auth.prototype.clear = function () {
        delete this.req.session.userId;
        delete this.req.session.userName;
    };
    return Auth;
})();
exports.Auth = Auth;

