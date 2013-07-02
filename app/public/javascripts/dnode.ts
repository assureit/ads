///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='./api.ts'/>
///<reference path='./dcaseviewer-addons.ts'/>

interface DCaseMetaContent {
}

interface DCaseNodeBody {
	id?: number;
	name?: string;
	type?: string;
	description: string;
	metadata: DCaseMetaContent[];
	children?: DCaseNodeBody[];
}

interface DCaseNodeTypes { //type?
	Goal?: any;
	Context?: any;
	Subject?: any;
	Strategy?: any;
	Evidence?: any;
	Solution?: any;
	Rebuttal?: any;
	Monitor?: any;
}

interface DCaseNodeRawData {
	/* TODO Needs to merge into DCaseNodeModel class */
	ThisNodeId: number;
	NodeType: string;
	Description: string;
	Children: number[];
	Contexts: number[]; // TODO USE IT
	MetaData: any;
}
class DCaseNodeModel {
	id: number;
	name: string;
	type: string;
	desc: string;
	metadata: DCaseMetaContent[];
	children: DCaseNodeModel[];
	contexts: DCaseNodeModel[];
	parent: DCaseNodeModel;

	isContext: bool = false;
	isArgument: bool = false;
	isUndeveloped: bool = false;
	isDScript: bool = false;

	static TYPES: string[] = [
		"Goal",
		"Context",
		"Subject",
		"Strategy",
		"Evidence",
		"Solution",
		"Rebuttal",
		"Monitor"
	];

	static SELECTABLE_TYPES: DCaseNodeTypes = {
		"Goal": [
				"Goal",
				"Context",
				"Subject",
				"Strategy",
				"Evidence",
				"Solution",
				"Monitor"
				],
		"Context": [],
		"Subject": [],
		"Strategy": [
				"Goal", 
				"Context"
			],
		"Evidence": [
				"Rebuttal"
			],
		"Solution": [
				"Context", 
				"Rebuttal"
			],
		"Rebuttal": [],
		"Monitor": [
				"Context", 
				"Rebuttal"
			]
	};

	static NAME_PREFIX: DCaseNodeTypes = {
		"Goal": "G_",
		"Context": "C_",
		"Subject": "Sub_",
		"Strategy": "S_",
		"Evidence": "E_",
		"Solution": "Sol_",
		"Rebuttal": "R_",
		"Monitor": "M_"
	};

	constructor (id: number, name: string, type: string, desc: string, metadata: DCaseMetaContent[]) { //FIXME
		this.id = id;
		this.name = name;
		this.type = type;
		this.desc = desc;
		this.metadata = metadata;
		this.children = [];
		this.contexts = [];
		this.parent = null;
		this.updateFlags();
		if(type == "Solution") {
			this.isDScript = true;
		} else if(type == "Context" || type == "Subject" || type == "Rebuttal") {
			this.isContext = true;
		}
	}

	getNodeCount(): number {
		return this.children.length + this.contexts.length;
	}

	eachChildren(f: (i: number, v: DCaseNodeModel) => void): void { //FIXME
		for(var i: number = 0; i < this.children.length; ++i){
			f(i, this.children[i]);
		}
	}

	eachContexts(f: (i: number, v: DCaseNodeModel) => void): void {
		for(var i: number = 0; i < this.contexts.length; ++i){
			f(i, this.contexts[i]);
		}
	}

	eachContents(f: (i: number, v: DCaseMetaContent) => void): void {
		for(var i: number = 0; i < this.metadata.length; ++i){
			f(i, this.metadata[i]);
		}
	}

	eachSubNode(f: (i: number, v: DCaseNodeModel) => void): void {
		this.eachContexts(f);
		this.eachChildren(f);
	}

	traverse(f: (i: number, v: DCaseNodeModel) => void): void {
		function traverse_(n: DCaseNodeModel, f: (i: number, v: DCaseNodeModel) => void): void {
			n.eachSubNode((i: number, v: DCaseNodeModel) => {
				f(i, v);
				traverse_(v, f)
			});
		}
		f(-1, this);
		traverse_(this, f);
	}

	deepCopy(): DCaseNodeModel { //FIXME
		var node: DCaseNodeModel = new DCaseNodeModel(this.id, this.name, this.type, this.desc, this.metadata);
		this.eachSubNode((i: number, v: DCaseNodeModel) => {
			node.insertChild(v.deepCopy(), i);
		});
		return node;
	}

	insertChild(node: DCaseNodeModel, index?: number): void {
		var a: DCaseNodeModel[] = node.isContext ? this.contexts : this.children;
			if(index == null) {
				index = a.length;
			}
		a.splice(index, 0, node);
		node.parent= this; 
		this.updateFlags();
	}

	removeChild(node: DCaseNodeModel): void {
		var a: DCaseNodeModel[] = node.isContext ? this.contexts : this.children;
		var i: number = a.indexOf(node);
		a.splice(i, 1);
		node.parent = null; 
		this.updateFlags();
	}

	updateFlags(): void {
		if(this.type == "Goal") {
			this.isArgument = this.contexts.length != 0;
			this.isUndeveloped = this.children.length == 0;
		}
	}

	getHtmlDescription(): string {
		if(this.desc == "") {
			return "<font color=\"gray\">(no description)</font>";
		} else {
			return this.desc.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
		}
	}

	getHtmlMetadata(): JQuery { 
		var innerText: string = generateMetadata(this);
		var divText: string = "<div></div>";
		//if(innerText != "") {
		//	divText = "<div>Metadata</div>";
		//}
		return $(divText).append($("<font color=\"black\">" + innerText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") + "</font>")).addClass("node-text-metadata").css("background-color", "gray").css("opacity", "0.5");
	}

	appendableTypes(): string[] {
		return DCaseNodeModel.SELECTABLE_TYPES[this.type];
	}

	isTypeApendable(type: string): bool {
		return (DCaseNodeModel.SELECTABLE_TYPES[this.type].indexOf(type) != -1);
	}

	toJson(): DCaseNodeBody {   //FIXME?
		var children: DCaseNodeBody[] = [];
		this.eachSubNode((i: number, node: DCaseNodeModel) => { 
			children.push(node.toJson());
		})
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			description: this.desc,
			metadata: this.metadata,
			children: children
		};
	}
}

interface DCaseTreeRawData {
	NodeList: DCaseNodeRawData[];
	TopGoalId: number;
	NodeCount: number;
}

class DCaseTree {   //FIXME
	NodeList: any[]; //FIXME ver0.9.x (DCaseNodeModel and DCaseNodeRawData)
	TopGoalId: number;
	NodeCount: number;
	DCaseName: string;

	constructor(tl: DCaseNodeModel[], id: number, nodeCount: number);
	constructor(tl: DCaseNodeRawData[], id: number, nodeCount: number);
	constructor(tl: any[], id: number, nodeCount: number) {
		this.NodeList = tl;
		this.TopGoalId = id;
		this.NodeCount = nodeCount;
	}
}

interface DCaseOperation {
	undo: () => void;
	redo: () => void;
}

class DCaseModel {
	node: DCaseNodeModel;
	commitId: number;
	argId: number;
	opQueue: DCaseOperation[];   //FIXME?
	undoCount: number;
	nodeCount: number;
	typeCount: DCaseNodeTypes;
	views: DCaseViewer[];  //FIXME?

	constructor(tree: DCaseTreeRawData, argId: number, commitId: number) { 
		this.node = null;
		this.commitId = commitId;
		this.argId = argId;
		this.opQueue = [];
		this.undoCount = 0;
		this.nodeCount = 0;
		this.typeCount = {};
		this.views = [];

		var types: string[] = DCaseNodeModel.TYPES;
		for(var i: number = 0; i < types.length; i++) {
			this.typeCount[types[i]] = 1;
		}
		this.decode(tree);
	}

	decode(tree: DCaseTreeRawData): void {
		// function contextParams(params) {
		// var s = "";
		// for(key in params) {
		// s += "@" + key + " : " + params[key] + "\n";

		// }
		// return s;
		// }

		var self: DCaseModel = this;
		var nodes: DCaseNodeRawData[] = [];
		for(var i: number = 0; i < tree.NodeList.length; i++) {
			var c: DCaseNodeRawData = tree.NodeList[i];
			nodes[c.ThisNodeId] = c; 
		}

		function create(id: number): DCaseNodeModel { //FIXME?
			var data: DCaseNodeRawData = nodes[id];
			var type: string = data.NodeType;
			var desc: string = data.Description;
			//var metadata: DCaseMetaContent[] = data.metadata ? data.metadata : null;
			var metadata: DCaseMetaContent[] = null; /* TODO Handle metadata */
			var metadata_raw: any = data.MetaData;
			if (metadata_raw instanceof Array) {
				metadata = metadata_raw;
			} else if (metadata_raw != null) {
				metadata = [metadata_raw]
			} else {
				metadata = [];
			}
			var node: DCaseNodeModel = self.createNode(id, type, desc, metadata);
			for(var i: number = 0; i < data.Children.length; i++) {
				node.insertChild(create(data.Children[i]), i);
			}
			return node;
		}

		var topId: number = tree.TopGoalId;
		this.node = create(topId);
		this.nodeCount = tree.NodeCount;
	}

	encode(): DCaseTree {
		var tl: DCaseNodeRawData[] = [];  //FIXME?
		var node: DCaseNodeModel = this.node;
		node.traverse((i: number, v: DCaseNodeModel) => {
			var c: number[] = [];
			v.eachSubNode((i: number, v: DCaseNodeModel) => {
				console.log(v.id);
				c.push(v.id);
			});
			tl.push({
				ThisNodeId: v.id,
				NodeType: v.type,
				Description: v.desc,
				Children: c,
				Contexts: [],
				MetaData: v.metadata
			});
		});
		return new DCaseTree(tl, node.id, this.nodeCount);
	}

	isChanged(): bool {
		return this.opQueue.length - this.undoCount > 0;
	}

	getArgumentId(): number {
		return this.argId;
	}

	getCommitId(): number {
		return this.commitId;
	}

	getTopGoal(): DCaseNodeModel {
		return this.node;
	}

	createNode(id: number, type: string, desc: string, metadata: DCaseMetaContent[]): DCaseNodeModel {
		var name: string = DCaseNodeModel.NAME_PREFIX[type] + id.toString();
		return new DCaseNodeModel(id, name, type, desc, metadata);
	}

	copyNode(node: DCaseNodeModel): DCaseNodeModel {
		var self: DCaseModel = this;
		var newNode: DCaseNodeModel = self.createNode(++this.nodeCount, node.type, node.desc, node.metadata);
		node.eachSubNode((i: number, v: DCaseNodeModel) => {
			newNode.insertChild(self.copyNode(v), i);
		});
		return newNode;
	}

	insertNode(parent: DCaseNodeModel, type: string, desc: string, metadata: DCaseMetaContent[], index?: number): DCaseNodeModel {
		if(index == null) {
			index = parent.children.length;
		}
		var id: number = ++this.nodeCount;
		var node: DCaseNodeModel = this.createNode(id, type, desc, metadata);
		this.applyOperation({
			redo: () => {
				parent.insertChild(node, index);
				this.nodeInserted(parent, node, index);
			},
			undo: () => {
				parent.removeChild(node);
				this.nodeRemoved(parent, node, index);
			}
		});
		return node;
	}

	pasteNode(parent: DCaseNodeModel, old_node: DCaseNodeModel, index?: number): void {
		if(index == null) {
			index = parent.children.length;
		}
		var node: DCaseNodeModel = this.copyNode(old_node);
		this.applyOperation({
			redo: () => {
				parent.insertChild(node, index);
				this.structureUpdated();
			},
			undo: () => {
				parent.removeChild(node);
				this.structureUpdated();
			}
		});
	}

	removeNode(node: DCaseNodeModel): void {
		var parent: DCaseNodeModel = node.parent;
		var index: number = parent.children.indexOf(node);
		this.applyOperation({
			redo: () => {
				parent.removeChild(node);
				this.nodeRemoved(parent, node, index);
			},
			undo: () => {
				parent.insertChild(node, index);
				this.nodeInserted(parent, node, index);
			}
		});
	}

	setDescription(node: DCaseNodeModel, desc: string): void {
		var oldDesc: string = node.desc;
		this.applyOperation({
			redo: () => {
				node.desc = desc;
				this.nodeChanged(node);
			},
			undo: () => {
				node.desc = oldDesc;
				this.nodeChanged(node);
			}
		});
	}

	updateTypeFlag(node: DCaseNodeModel): void {
		node.isDScript = (node.type === "Solution");
		node.isContext = (node.type === "Context" || node.type === "Subject" || node.type === "Rebuttal");
	}

	setType(node: DCaseNodeModel, type: string): void {
		var oldType: string = node.type;
		this.applyOperation({
			redo: () => {
				node.type = type;
				this.updateTypeFlag(node);
				this.nodeChanged(node);
			},
			undo: () => {
				node.type = oldType;
				this.updateTypeFlag(node);
				this.nodeChanged(node);
			}
		});
	}

	setParam(node: DCaseNodeModel, type: string, name: string, desc: string, metadata: DCaseMetaContent[]): void {
		var oldType: string = node.type;
		var oldName: string = node.name;
		var oldDesc: string = node.desc;
		var oldMetadata: DCaseMetaContent[] = node.metadata;
		node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
		this.applyOperation({
			redo: () => {
				node.type = type;
				node.name = name;
				node.desc = desc;
				node.metadata = metadata;
				node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
				this.updateTypeFlag(node);
				this.nodeChanged(node);
			},
			undo: () => {
				node.type = oldType;
				node.name = oldName;
				node.desc = oldDesc;
				node.metadata = oldMetadata;
				node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
				this.updateTypeFlag(node);
				this.nodeChanged(node);
			}
		});
	}

	undo(): bool {
		var n: number = this.opQueue.length;
		if(n > this.undoCount) {
			this.undoCount++;
			var op: DCaseOperation = this.opQueue[n - this.undoCount]; //FIXME?
			op.undo();
			return true;
		} else {
			return false;
		}
	}

	redo(): bool {
		if(this.undoCount > 0) {
			var op: DCaseOperation = this.opQueue[this.opQueue.length - this.undoCount];   //FIXME?
			this.undoCount--;
			op.redo();
			return true;
		} else {
			return false;
		}
	}

	applyOperation(op: DCaseOperation): void { //FIXME?
		this.opQueue.splice(this.opQueue.length - this.undoCount, this.undoCount, op);
		this.undoCount = 0;
		op.redo();
	}

	commit(msg: string): bool {  //FIXME?
		var tree: DCaseTree = this.encode();
		var r: number = DCaseAPI.commit(tree, msg, this.commitId);
		this.commitId = r;
		this.undoCount = 0;
		this.opQueue = [];
		return true;
	}

	addListener(view: DCaseViewer): void {  //FIXME?
		this.views.push(view);
	}

	removeListener(view: DCaseViewer): void {
		this.views.splice(this.views.indexOf(view), 1);
	}

	structureUpdated(): void {  //FIXME
		$.each(this.views, (i: number, view: DCaseViewer) => {
			view.structureUpdated();
		});
	}

	nodeInserted(parent: DCaseNodeModel, node: DCaseNodeModel, index: number): void {   //FIXME
		$.each(this.views, (i: number, view: DCaseViewer) => {
			view.nodeInserted(parent, node, index);
		});
	}

	nodeRemoved(parent: DCaseNodeModel, node: DCaseNodeModel, index: number): void {    //FIXME
		$.each(this.views, (i: number, view: DCaseViewer) => {
			view.nodeRemoved(parent, node, index);
		});
	}

	nodeChanged(node: DCaseNodeModel): void {   //FIXME
		$.each(this.views, (i: number, view: DCaseViewer) => {
			view.nodeChanged(node);
		});
	}
}
