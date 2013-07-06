///<reference path='../DefinitelyTyped/node/node.d.ts'/>

export class Exporter {
	constructor() {
	}

	emit(m: any): string { //TODO Interface m;
		return '';
	}
}

export class ResponseSource {
	stack: string[] = [];
	src: string = "";
	header: string = "";

	constructor() {
	}

	printlnHeader(s: string) : void {
		this.header += s + '\n';
	}

	print(s: string, i?: number) : void {
		if(i == null) {
			this.src += s;
		}else {
			this.stack[i] += s;
		}
	}

	println(s: string, i?: number) : void {
		if(i == null) {
			this.src += s + '\n';
		}else {
			this.stack[i] += s + '\n';
		}
	}

	push(): number {
		var ret = this.stack.push(this.src);
		this.src = "";
		return ret - 1; //Array#push returns length of array
	}

	emit(): string {
		var ret:string = this.header;
		ret += this.src;
		for(var i:number = this.stack.length-1; i >= 0; i--) {
			ret += this.stack[i];
		}
		return ret;
	}
}

export class DScriptExporter extends Exporter {
	res: ResponseSource = new ResponseSource();
	nodeList: any[];
	root: any;
	goalIndex: number = 0;

	constructor() {
		super();
	}

	FindById(id: number):any {
		for(var i: number = 0; i < this.nodeList.length; i++) {
			var node: any = this.nodeList[i];
			var thisId = node.ThisNodeId;
			if(node.ThisNodeId == id) {
				return node;
			}
		}
		return null;
	}

	GetContextData(Children: number[]): any {
		var ret = {};
		for(var i: number = 0; i < Children.length; i++) {
			var node = this.FindById(Children[i]);
			if(node.NodeType == 'Context') {
				//TODO
			}
		}
		return ret;
	}

	GenerateStrategyCode(id: number): number[] {
		var node = this.FindById(id);
		if(node == null) {
			return;
		}
		var ret: number[] = [];
		var context = this.GetContextData(node.Children);
		for(var i: number = 0; i < node.Children.length; i++) {
			var c = this.FindById(node.Children[i]);
			if(c!=null) {
				if(c.NodeType == 'Goal') {
					this.GenerateGoalCode(node.Children[i]);
					ret.push(node.Children[i]);
				}
			}
		}
		return ret;
	}

	GenerateGoalCode(id: number): void {
		var node = this.FindById(id);
		if(node == null) {
			return;
		}
		this.res.print(""); //FIXME
		var indent = this.res.push();
		this.res.println("boolean Goal_" + id + "() {",indent); //FIXME
		for(var i: number = 0; i < node.Children.length; i++) {
			var c = this.FindById(node.Children[i]);
			if(c!=null) {
				if(c.NodeType == 'Strategy') {
					var subGoalIds:number[] = this.GenerateStrategyCode(node.Children[i]);
					var run:string = "    return ";
					for(var i:number = 0; i < subGoalIds.length; i++) { //TODO
						run += "Goal_" + subGoalIds[i] + "() && ";
					}
					run = run.slice(0,-4) + ";"
					this.res.println(run, indent);
				}else if(c.NodeType == 'Evidence') {
					this.res.println('    return true;', indent);
				}else if(c.NodeType == 'Solution') {
					this.res.println("    try {",indent);
					var l = c.Description.split("\n");
					for(var i:number = 0; i < l.length; i++) {
						if(l[i].match("    ")) {
							this.res.println('    '+ l[i], indent);
						}else {
							this.res.println('    //' + l[i], indent);
						}
					}
					this.res.println("    } catch(Exception e) {", indent);
					this.res.println("        Syslog.write(e.printStackTrace);",indent);
					this.res.println("        return false;",indent);
					this.res.println("    }",indent);
					this.res.println("    return true;",indent);
				}
			}
		}

		this.res.println("}", indent);
		this.res.println('',indent);
	}

	export(m: any): string {
		var json = JSON.parse(m).contents;
		this.nodeList = json.NodeList;
		this.root = this.FindById(json.TopGoalId);

		this.res.printlnHeader("//D-Script Generator v0.1");
		this.res.printlnHeader('');
		this.res.printlnHeader("//"+this.root.Description.replace("\n", "").replace("\r", ""));
		this.res.printlnHeader('');

		this.GenerateGoalCode(json.TopGoalId);

		return this.res.emit();
	}
}
