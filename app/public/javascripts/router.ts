///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

var Router = (function(){

	function parseParameters(hash) {
		var params = hash.split("/").filter(function(it){ return it != ""});
		if(params.length == 0) {
			params = [""];
		}
		return { name: params[0], args: params.slice(1)};
	}

	function Router() {
		this.table = {};
		var self = this;
		if ("onhashchange" in window) { //FIXME
			window.onhashchange = function () {
				var hash = parseParameters(window.location.hash.slice(1));
				if(hash.name in self.table) {
					self.table[hash.name](hash.args[0]);
				} else {
					window.location.hash = "";
				}
			};
		}
	}

	Router.prototype.route = function(route, name, callback) {
		this.table[name] = callback;
	};

	Router.prototype.start = function() {
		(<any>window).onhashchange();
	}

	return Router;
})();
