var subRouter = (function () {
    function subRouter(name, args) {
        this.name = name;
        this.args = args;
    }
    return subRouter;
})();
var Router = (function () {
    function Router() { }
    Router.prototype.parseParameters = function (hash) {
        var params = hash.split("/").filter(function (it) {
            return it != "";
        });
        if(params.length == 0) {
            params = [
                ""
            ];
        }
        return new subRouter(params[0], params.slice(1));
    };
    Router.prototype.Router = function () {
        this.table = {
        };
        var self = this;
        if("onhashchange" in window) {
            window.onhashchange = function () {
                var hash = self.parseParameters(window.location.hash.slice(1));
                if(hash.name in self.table) {
                    self.table[hash.name](hash.args[0]);
                } else {
                    window.location.hash = "";
                }
            };
        }
    };
    Router.prototype.router = function (router, name, callback) {
        this.table[name] = callback;
    };
    Router.prototype.start = function () {
        (window).onhashchange();
    };
    return Router;
})();
;
