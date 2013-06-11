//-----------------------------------------------------------------------------

var DCaseNode = function(id, name, type, desc) {
	this.id = id;
	this.name = name;
	this.type = type;
	this.desc = desc;
	this.children = [];
	this.contexts = [];
	this.parents = [];

	this.updateFlags();
	if(type == "Solution") {
		this.isDScript = true;
	} else
	if(type == "Context" || type == "Subject" || type == "Rebuttal") {
		this.isContext = true;
	}
};

DCaseNode.prototype.isContext = false;
DCaseNode.prototype.isArgument = false;
DCaseNode.prototype.isUndeveloped = false;
DCaseNode.prototype.isDScript = false;

//-----------------------------------------------------------------------------

DCaseNode.prototype.getNodeCount = function() {
	return this.children.length + this.contexts.length;
};

DCaseNode.prototype.eachNode = function(f) {
	$.each(this.contexts, function(i, node) {
		f(node);
	});
	$.each(this.children, function(i, node) {
		f(node);
	});
};

DCaseNode.prototype.traverse = function(f, parent, index) {
	var self = this;
	f(this, parent, index);

	$.each(this.contexts, function(i, node) {
		node.traverse(f, self, i);
	});
	$.each(this.children, function(i, node) {
		node.traverse(f, self, i);
	});
};

DCaseNode.prototype.deepCopy = function() {//FIXME id
	var node = new DCaseNode(this.id, this.name, this.type, this.desc);
	this.eachNode(function(child) {
		node.insertChild(child.deepCopy());
	});
	return node;
};

//-----------------------------------------------------------------------------

DCaseNode.prototype.insertChild = function(node, index) {
	var a = node.isContext ? this.contexts : this.children;
	if(index == null) index = a.length;
	a.splice(index, 0, node);

	node.parents.push(this);
	this.updateFlags();
};

DCaseNode.prototype.removeChild = function(node) {
	var a = node.isContext ? this.contexts : this.children;
	var i = a.indexOf(node);
	a.splice(i, 1);

	node.parents.splice(node.parents.indexOf(this), 1);
	this.updateFlags();
};

DCaseNode.prototype.updateFlags = function() {
	if(this.type == "Goal") {
		this.isArgument = this.contexts.length != 0;
		this.isUndeveloped = this.children.length == 0;
	}
};

DCaseNode.prototype.getHtmlDescription = function() {
	if(this.desc == "") {
		return "<font color=\"gray\">(no description)</font>";
	} else {
		return this.desc
			.replace(/</g, "&lt;").replace(/>/g, "&gt;")
			.replace(/\n/g, "<br>");
	}
};

DCaseNode.prototype.appendableTypes = function() {
	return DCaseNode.SELECTABLE_TYPES[this.type];
};

DCaseNode.prototype.isTypeApendable = function(type) {
	return (DCaseNode.SELECTABLE_TYPES[this.type].indexOf(type) != -1);
};

DCaseNode.prototype.toJson = function() {
	var children = [];
	this.eachNode(function(node) {
		children.push(node.toJson());
	});
	return {
		id: this.id,
		name: this.name,
		type: this.type,
		description: this.desc,
		children: children
	};
};

//-----------------------------------------------------------------------------

DCaseNode.TYPES = [
	"Goal", "Context", "Subject",
	"Strategy", "Evidence", "Solution", "Rebuttal", "Monitor"
];

DCaseNode.SELECTABLE_TYPES = {
	"Goal": [ "Goal", "Context", "Subject", "Strategy", "Evidence", "Solution" , "Monitor" ],
	"Context": [],
	"Subject": [],
	"Strategy": [ "Goal", "Context" ],
	"Evidence": [ "Rebuttal" ],
	"Solution": [ "Context", "Rebuttal" ],
	"Rebuttal": [],
	"Monitor": [ "Context", "Rebuttal" ],
};

DCaseNode.NAME_PREFIX = {
	"Goal": "G_",
	"Context": "C_",
	"Subject": "Sub_",
	"Strategy": "S_",
	"Evidence": "E_",
	"Solution": "Sol_",
	"Rebuttal": "R_",
	"Monitor": "M_",
};

//-----------------------------------------------------------------------------

var DCase = function(tree, argId, commitId) {
	this.node = null;
	this.commitId = commitId;
	this.argId = argId;
	this.opQueue = [];
	this.undoCount = 0;
	this.nodeCound = 0;
	this.typeCount = {};
	this.view = [];

	var types = DCaseNode.TYPES;
	for(var i=0; i<types.length; i++) {
		this.typeCount[types[i]] = 1;
	}
	this.decode(tree);
};

//-----------------------------------------------------------------------------

DCase.prototype.decode = function(tree) {
	function contextParams(params) {
		var s = "";
		for(key in params) {
			s += "@" + key + " : " + params[key] + "\n";
		}
		return s;
	}

	var self = this;
	var nodes = [];
	for(var i=0; i<tree.NodeList.length; i++) {
		var c = tree.NodeList[i];
		nodes[c.ThisNodeId] = c;
	}
	function create(id) {
		var data = nodes[id];
		var type = data.NodeType;
		var desc = data.Description;
		var node = self.createNode(id, type, desc);
		for(var i=0; i<data.Children.length; i++) {
			node.insertChild(create(data.Children[i]));
		}
		return node;
	}
	var topId = tree.TopGoalId;
	this.node = create(topId);
	this.nodeCount = tree.NodeCount;
};

DCase.prototype.encode = function() {
	var tl = [];
	var node = this.node;
	node.traverse(function(node) {
		var c = [];
		node.eachNode(function(node) {
			c.push(node.id);
		});
		tl.push({
			ThisNodeId: node.id,
			NodeType: node.type,
			Description: node.desc,
			Children: c,
		});
	});
	var tree = {
		NodeList: tl,
		TopGoalId: node.id,
		NodeCount: this.nodeCount
	};
	return tree;
};

//-----------------------------------------------------------------------------

DCase.prototype.isChanged = function() {
	return this.opQueue.length - this.undoCount > 0;
};

DCase.prototype.getArgumentId = function() {
	return this.argId;
};

DCase.prototype.getCommitId = function() {
	return this.commitId;
};

DCase.prototype.getTopGoal = function() {
	return this.node;
};

//-----------------------------------------------------------------------------

DCase.prototype.createNode = function(id, type, desc) {
	var name = DCaseNode.NAME_PREFIX[type] + id;
	return new DCaseNode(id, name, type, desc);
};

DCase.prototype.copyNode = function(node) {
	var self = this;
	var newNode = self.createNode(++this.nodeCount, node.type, node.desc);
	node.eachNode(function(child) {
		newNode.insertChild(self.copyNode(child));
	});
	return newNode;
};

DCase.prototype.insertNode = function(parent, type, desc, index) {
	var self = this;
	if(index == null) {
		index = parent.children.length;
	}
	var id = ++this.nodeCount;
	var node = this.createNode(id, type, desc);
	this.applyOperation({
		redo: function() {
			parent.insertChild(node, index);
			self.nodeInserted(parent, node, index);
		},
		undo: function() {
			parent.removeChild(node);
			self.nodeRemoved(parent, node, index);
		},
	});
	return node;
};

DCase.prototype.pasteNode = function(parent, old_node, index) {
	var self = this;
	if(index == null) {
		index = parent.children.length;//FIXME
	}
	var node = self.copyNode(old_node);

	this.applyOperation({
		redo: function() {
			parent.insertChild(node, index);
			self.structureUpdated();
		},
		undo: function() {
			parent.removeChild(node);
			self.structureUpdated();
		},
	});
};

DCase.prototype.removeNode = function(node) {
	var self = this;
	var parent = node.parents[0];
	var index = parent.children.indexOf(node);
	this.applyOperation({
		redo: function() {
			parent.removeChild(node);
			self.nodeRemoved(parent, node, index);
		},
		undo: function() {
			parent.insertChild(node, index);
			self.nodeInserted(parent, node, index);
		},
	});
};

DCase.prototype.setDescription = function(node, desc) {
	var self = this;
	var oldDesc = node.desc;
	this.applyOperation({
		redo: function() {
			node.desc = desc;
			self.nodeChanged(node);
		},
		undo: function() {
			node.desc = oldDesc;
			self.nodeChanged(node);
		},
	});
};

DCase.prototype.updateTypeFlag = function(node) {
	node.isDScript = (node.type === "Solution");
	node.isContext = (node.type === "Context" || node.type === "Subject" || node.type === "Rebuttal");
}

DCase.prototype.setType = function(node, type) {
	var self = this;
	var oldType = node.type;
	this.applyOperation({
		redo: function() {
			node.type = type;
			self.updateTypeFlag(node);
			self.nodeChanged(node);
		},
		undo: function() {
			node.type = oldType;
			self.updateTypeFlag(node);
			self.nodeChanged(node);
		},
	});
};

DCase.prototype.setParam = function(node, type, name, desc) {
	var self = this;
	var oldType = node.type;
	var oldName = node.name;
	var oldDesc = node.desc;
	node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
	this.applyOperation({
		redo: function() {
			node.type = type;
			node.name = name;
			node.desc = desc;
			node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
			self.updateTypeFlag(node);
			self.nodeChanged(node);
		},
		undo: function() {
			node.type = oldType;
			node.name = oldName;
			node.desc = oldDesc;
			node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
			self.updateTypeFlag(node);
			self.nodeChanged(node);
		},
	});
};



DCase.prototype.undo = function() {
	var n = this.opQueue.length;
	if(n > this.undoCount) {
		this.undoCount++;
		var op = this.opQueue[n - this.undoCount];
		op.undo();
		return true;
	} else {
		return false;
	}
};

DCase.prototype.redo = function() {
	if(this.undoCount > 0) {
		var op = this.opQueue[this.opQueue.length - this.undoCount];
		this.undoCount--;
		op.redo();
		return true;
	} else {
		return false;
	}
};

DCase.prototype.applyOperation = function(op) {
	this.opQueue.splice(this.opQueue.length - this.undoCount, this.undoCount, op);
	this.undoCount = 0;
	op.redo();
};

DCase.prototype.commit = function(msg, userId) {
	var tree = this.encode();
	var r = DCaseAPI.commit(tree, msg, this.commitId, userId);
	this.commitId = r;
	this.undoCount = 0;
	this.opQueue = [];
	return true;
};

//-----------------------------------------------------------------------------

DCase.prototype.addListener = function(view) {
	this.view.push(view);
};

DCase.prototype.removeListener = function(view) {
	this.view.splice(this.view.indexOf(view), 1);
};

DCase.prototype.structureUpdated = function() {
	$.each(this.view, function(i, view) {
		view.structureUpdated();
	});
};

DCase.prototype.nodeInserted = function(parent, node, index) {
	$.each(this.view, function(i, view) {
		view.nodeInserted(parent, node, index);
	});
};

DCase.prototype.nodeRemoved = function(parent, node, index){
	$.each(this.view, function(i, view) {
		view.nodeRemoved(parent, node, index);
	});
};

DCase.prototype.nodeChanged = function(node){
	$.each(this.view, function(i, view) {
		view.nodeChanged(node);
	});
};

