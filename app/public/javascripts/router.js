var subRouter = (function () {
    function subRouter(name, args) {
        this.name = name;
        this.args = args;
    }
    return subRouter;
})();
var Router = (function () {
    function Router() {
        var _this = this;
        this.table = {
        };
        this.onChange = function () {
            var hash = _this.parseParameters(window.location.pathname);
            if(hash.name in _this.table) {
                _this.table[hash.name](hash.args[0]);
            }
        };
    }
    Router.prototype.parseParameters = function (hash) {
        var params = hash.split("/").filter(function (it) {
            return it != "" && it != Config.BASEPATH.replace(/\//g, "");
        });
        if(params.length == 0) {
            params = [
                ""
            ];
        }
        return new subRouter(params[0], params.slice(1));
    };
    Router.prototype.route = function (router, name, callback) {
        this.table[name] = callback;
    };
    Router.prototype.start = function () {
        this.onChange();
    };
    return Router;
})();
;
