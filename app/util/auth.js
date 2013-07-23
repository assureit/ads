var Auth = (function () {
    function Auth(req, res) {
        this.req = req;
        this.res = res;
    }
    Auth.prototype.isLogin = function () {
        return !!this.req.signedCookies.sessionUserId;
    };

    Auth.prototype.set = function (userId, loginName) {
        this.res.cookie('userId', userId);
        this.res.cookie('userName', loginName);
        this.res.cookie('sessionUserId', userId, { signed: true });
        this.res.cookie('sessionUserName', loginName, { signed: true });
    };

    Auth.prototype.getLoginName = function () {
        return this.req.signedCookies.sessionUserName;
    };

    Auth.prototype.getUserId = function () {
        if (this.req.signedCookies.sessionUserId)
            return parseInt(this.req.signedCookies.sessionUserId, 10);
        return undefined;
    };

    Auth.prototype.clear = function () {
        this.res.clearCookie('userId');
        this.res.clearCookie('userName');
        this.res.clearCookie('sessionUserId');
        this.res.clearCookie('sessionUserName');
    };
    return Auth;
})();
exports.Auth = Auth;

