var peg = require('./../public/assurejs/lib/ASNParser/peg')

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
}
