///<reference path='../DefinitelyTyped/node/node.d.ts' />
var peg = require('./../public/assurejs/lib/ASNParser/peg');

enum NodeType {
	Goal, Context, Strategy, Evidence
}

export class ASNParser {
	parseNodeList(asn:string): any[] {
		var obj = peg.parse(asn)[1];
		var node = [];
		var traverse = (n: any):void => {
			var children = n.Children;
			n.Children = [];
			node.push(n);
			if (children) {
				children.forEach((c:any) => {
					traverse(c);
				});
			}
		}
		traverse(obj);
		return node;
	}
	parse(asn:string): any[] {
		return peg.parse(asn)[1];
	}
	ConvertToASN(root, isSingleNode: boolean): string {
		var encoded : string = (function(model , prefix : string) : string {
			var IndentToken: string = "    ";
			var ret : string = "";
			switch (model.Label[0]) {
			case "G":
			case "g":
			//case NodeType["Goal"]:
				prefix += "*";
				ret += (prefix + " " + model.Label);
				break;
			default:
				if (prefix == "") prefix += "*";
				ret += (prefix + " " + model.Label);
				//console.log(model.Type);
			}
			//TODO:Label
			var anno_num = model.Annotations.length;
			if (anno_num != 0) {
				for (var i = 0; i < model.Annotations.length; i++) {
					ret += (" @" + model.Annotations[i].Name);
					if (model.Annotations[i].Body) {
						ret += (" "  + model.Annotations[i].Body);
					}
				}
			}
			ret += "\n";

			if (model.Statement && model.Statement != "") ret += (model.Statement + "\n");

			for(var key in model.Notes) {
				var Note = model.Notes[key];
				ret += key + "::" + Note + "\n";
			}

			if (isSingleNode) {
				return ret;
			}

			/* Insert newline in case a node consists of multiple lines (for presentation).*/
			if (ret.indexOf("\n") != ret.lastIndexOf("\n")) {
				ret += "\n";
			}

			for (var i = 0; i < model.Children.length; i++) {
				var child_model = model.Children[i];
				//console.log(child_model.Type);
				if (child_model.Label && (child_model.Label[0] == "C" || child_model.Label[0] == "c")) {
					ret += arguments.callee(child_model, prefix);
					break;
				}
			}
			for (var i = 0; i < model.Children.length; i++) {
				var child_model = model.Children[i];
				if (child_model.Label && (child_model.Label[0] != "C" && child_model.Label[0] != "c")) {
					ret += arguments.callee(child_model, prefix);
				}
			}
			return ret;
		})(root, "");
		//console.log(encoded);
		return encoded;
	}
}
