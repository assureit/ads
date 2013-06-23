///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

class subRouter{
	name : string;
	args : string[];
	constructor(name: string, args : string[]){
		this.name = name;
		this.args = args;
	}
}

class Router{
	table: { [key : string ] : (args :string)=>void;};
	onChange: ()=>void;
	parseParameters(hash : string) {

		var params: string[] = hash.split("/").filter(function(it){ return it != "" && it != "ait-test"});
		if(params.length == 0) {
			params = [""];
		}
		return  new subRouter(params[0], params.slice(1));
	}

	constructor() {
		this.table = {};
		this.onChange = () => {
			var hash : subRouter = this.parseParameters(window.location.pathname);
			if(hash.name in this.table) {
				this.table[hash.name](hash.args[0]);
			}
		};

		//var self = this;
		//if ("onhashchange" in window) { //FIXME
		//	window.onhashchange = function () {
		//		var hash : subRouter = self.parseParameters(window.location.hash.slice(1));
		//		if(hash.name in self.table) {
		//			self.table[hash.name](hash.args[0]);
		//		} else {
		//			window.location.hash = "";
		//		}
		//	};
		//}
	}

	route(router, name : string, callback : (args :string)=>void) : void {
		this.table[name] = callback;
	};

	start() : void {
		this.onChange();
	};
};
