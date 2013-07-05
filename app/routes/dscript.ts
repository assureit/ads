///<reference path='../DefinitelyTyped/node/node.d.ts'/>

export class Exporter {
	constructor() {
	}

	emit(m: any): string { //TODO Interface m;
		return '';
	}
}

function FindById(nodeList: any[], id: number):any {
	for(var i: number = 0; i < nodeList.length; i++) {
		var node: any = nodeList[i];
		var thisId = node.ThisNodeId;
		if(node.ThisNodeId == id) {
			return node;
		}
	}
	return null;
}

export class ResponseSource {
	src: string = "";

	constructor() {
	}

	print(s: string) : void {
		this.src += s;
	}

	println(s: string) : void {
		this.src += s;
		this.src += '\n';
	}

	emit(): string {
		return this.src;
	}
}

export class DScriptExporter extends Exporter {
	res: ResponseSource = new ResponseSource();
	solutionIndex:number = 0;
	goalContent:string = "";

	constructor() {
		super();
	}

	EmitIndent(level:number): string {
		var ret:string = "";
		for(var i: number = 0; i < level; i++) {
			ret += "    ";
		}
		return ret;
	}

	GenerateGoalCode(nodeList: any[], nodeId: number, level: number): void {
		var root:any = FindById(nodeList, nodeId);//any=Node
		var children:any[] = root.Children;
		var indent:string = this.EmitIndent(level);
		if(root.NodeType == "Solution") {
			this.res.println("boolean Solution_" + this.solutionIndex + "() {"); //FIXME
			this.res.println("    //" + this.goalContent);
			this.res.println("    try {");
			var l = root.Description.split("\n");
			for(var i:number = 0; i < l.length; i++) {
				this.res.println("        " + l[i]);
			}
			this.res.println("    } catch(Exception e) {");
			this.res.println("        Syslog.write(e.printStackTrace);");
			this.res.println("        return false;");
			this.res.println("    }");
			this.res.println("    return true;");
			this.res.println("}\n");
			this.solutionIndex += 1;
			this.goalContent = "";
			return;
		} else if(root.NodeType == "Goal") {
			this.goalContent = root["Description"];
		} else {
			this.res.println("//"+ root.NodeType + ":" + root.Description);
		}
		for(var i:number = 0; i < children.length; i++) {
			this.GenerateGoalCode(nodeList, children[i], 0)
		}
	}

	export(m: any): string { //FIXME m
		m = JSON.parse(m);
		var tree:     any    = m.contents;
		var rootId:   number = tree.TopGoalId;
		var nodeList: any[]  = tree.NodeList;
		var indent:   string = this.EmitIndent(0);
		var rootNode: any    = FindById(nodeList, rootId);
		this.res.println("//D-Script Generator v0.1");
		this.res.println("//"+rootNode.Description.replace("\n", "").replace("\r", ""));
		this.res.println('');

		for(var i: number = 0; i < rootNode.Children.length; i++) {
			this.GenerateGoalCode(nodeList, rootNode.Children[i], 0);
		}
		var run:string = "";
		for(var i:number = 0; i < this.solutionIndex; i++) {
			run += "Solution_" + i + "() && ";
		}
		run = run.slice(0,-4) + ";" //FIXME
		this.res.println(run);

		return this.res.emit();
	}
}
