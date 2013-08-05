///<reference path='../DefinitelyTyped/node/node.d.ts'/>

export interface StrategyValue {
	subGoalIds: number[];
	or: bool;
}

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
	footer: string = "";

	constructor() {
	}

	printlnHeader(s: string) : void {
		this.header += s + '\n';
	}

	printlnFooter(s: string) : void {
		this.footer += s + '\n';
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
		ret += this.footer;
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

	GetContextMetaData(Children: number[]): any {
		var ret = {};
		for(var i: number = 0; i < Children.length; i++) {
			var node = this.FindById(Children[i]);
			if(node.NodeType == 'Context') {
				for(var i:number = 0; i < node.MetaData.length; i++) {
					if(node.MetaData[i].Type == "Parameter") {
						delete node.MetaData[i].Type;
						delete node.MetaData[i].Visible;
						delete node.MetaData[i].Description;
						ret = node.MetaData[i];
					}
				}
			}
		}
		return ret;
	}

	emitCommentDescription(description:string, index:number, indent:string, comment?: string): void {
		if(comment == null) {
			comment = '//';
		}
		var h:string[] = description.split('\n');
		for(var i:number = 0; i < h.length; i++) {
			this.res.println(indent+comment+h[i], index);
		}
	}

	GenerateStrategyCode(id: number): StrategyValue {
		var node = this.FindById(id);
		if(node == null) {
			return;
		}
		var ret = <StrategyValue>{subGoalIds: [], or: false};
		for(var i: number = 0; i < node.Children.length; i++) {
			var c = this.FindById(node.Children[i]);
			if(c!=null) {
				if(c.NodeType == 'Goal') {
					this.GenerateGoalCode(node.Children[i]);
					ret.subGoalIds.push(node.Children[i]);
				}
				if(c.NodeType == 'Context') {
					ret.or = c.Description.match('||')!=null?true:false;
				}
			}
		}
		return ret;
	}

	GenerateGoalCode(id: number, b?:bool): void {
		var node = this.FindById(id);
		if(node == null) {
			return;
		}
		var indent = this.res.push();
		this.emitCommentDescription(node.Description, indent,'');
		this.res.println("boolean Goal_" + id + "(Context parent) {",indent); //FIXME
		var context = this.GetContextMetaData(node.Children);
		this.res.println('    Context con = new Context('+JSON.stringify(context)+');',indent);
		this.res.println('    con.setParent(parent);', indent);
		for(var i: number = 0; i < node.Children.length; i++) {
			var c = this.FindById(node.Children[i]);
			if(c!=null) {
				if(c.NodeType == 'Strategy') {
					var strategy: StrategyValue = this.GenerateStrategyCode(node.Children[i]);
					var run:string = "    return ";
					var op: string = strategy.or? "||" : "&&"
					for(var i:number = 0; i < strategy.subGoalIds.length; i++) { //TODO
						run += "Goal_" + strategy.subGoalIds[i] + "(con) "+op+" ";
					}
					run = run.slice(0,-4) + ";"
					this.res.println(run, indent);
				}else if(c.NodeType == 'Evidence') {
					this.emitCommentDescription(node.Description, indent,'    ');
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
		this.res.printlnHeader('');

		this.GenerateGoalCode(json.TopGoalId);

		this.res.printlnFooter("void main() {");
		this.res.printlnFooter("    Goal_"+json.TopGoalId+"(null);");
		this.res.printlnFooter("}");
		this.res.printlnFooter("");
		this.res.printlnFooter("main();");
		return this.res.emit();
	}
}

export class BashExporter extends DScriptExporter {
	res: ResponseSource = new ResponseSource();
	nodeList: any[];
	root: any;
	goalIndex: number = 0;

	constructor() {
		super();
	}

	GenerateGoalCode(id: number, b?:bool): void {
		var node = this.FindById(id);
		if(node == null) {
			return;
		}
		var indent = this.res.push();
		this.emitCommentDescription(node.Description, indent,'', '#');
		this.res.println("function Goal_" + id + "() {",indent); //FIXME
		var context = this.GetContextMetaData(node.Children);
		this.res.println('#    Context con = new Context('+JSON.stringify(context)+');',indent);
		this.res.println('#    con.setParent(parent);', indent);
		for(var i: number = 0; i < node.Children.length; i++) {
			var c = this.FindById(node.Children[i]);
			if(c!=null) {
				if(c.NodeType == 'Strategy') {
					var strategy: StrategyValue = this.GenerateStrategyCode(node.Children[i]);
					var run:string = "    return ";
					var op: string = strategy.or? "||" : "&&"
					for(var i:number = 0; i < strategy.subGoalIds.length; i++) { //TODO
						run += "Goal_" + strategy.subGoalIds[i] + "(con) "+op+" ";
					}
					run = run.slice(0,-4) + ";"
					this.res.println(run, indent);
				}else if(c.NodeType == 'Evidence') {
					this.emitCommentDescription(c.Description, indent,'    ', '#');
					this.res.println('    return true;', indent);
				}else if(c.NodeType == 'Solution') {
					this.res.println("#    try {",indent);
					var l = c.Description.split("\n");
					for(var i:number = 0; i < l.length; i++) {
						if(l[i].match("    ")) {
							this.res.println('    '+ l[i], indent);
						}else {
							this.res.println('    #' + l[i], indent);
						}
					}
					this.res.println("#    } catch(Exception e) {", indent);
					this.res.println("#       Syslog.write(e.printStackTrace);",indent);
					this.res.println("#        return false;",indent);
					this.res.println("#    }",indent);
					this.res.println("#    return true;",indent);
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

		this.res.printlnHeader("#!/bin/bash");
		this.res.printlnHeader("#Bash Generator v0.1");
		this.res.printlnHeader('');
		this.res.printlnHeader('');

		this.GenerateGoalCode(json.TopGoalId);

		this.res.printlnFooter("void main() {");
		this.res.printlnFooter("    Goal_"+json.TopGoalId+"(null);");
		this.res.printlnFooter("}");
		this.res.printlnFooter("");
		this.res.printlnFooter("main();");
		return this.res.emit();
	}
}
