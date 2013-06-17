var DCaseMetaContent = (function () {
    function DCaseMetaContent(type, text) {
        this.type = type;
        this.text = text;
    }
    DCaseMetaContent.prototype.clone = function () {
        return new DCaseMetaContent(this.type, this.text);
    };
    return DCaseMetaContent;
})();
var DCaseNodeModel = (function () {
    function DCaseNodeModel(id, name, type, desc, metadata) {
        this.isContext = false;
        this.isArgument = false;
        this.isUndeveloped = false;
        this.isDScript = false;
        this.id = id;
        this.name = name;
        this.type = type;
        this.desc = desc;
        this.metadata = metadata;
        this.children = [];
        this.contexts = [];
        this.parents = [];
        this.updateFlags();
        if(type == "Solution") {
            this.isDScript = true;
        } else if(type == "Context" || type == "Subject" || type == "Rebuttal") {
            this.isContext = true;
        }
    }
    DCaseNodeModel.TYPES = [
        "Goal", 
        "Context", 
        "Subject", 
        "Strategy", 
        "Evidence", 
        "Solution", 
        "Rebuttal", 
        "Monitor"
    ];
    DCaseNodeModel.SELECTABLE_TYPES = {
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
    DCaseNodeModel.NAME_PREFIX = {
        "Goal": "G_",
        "Context": "C_",
        "Subject": "Sub_",
        "Strategy": "S_",
        "Evidence": "E_",
        "Solution": "Sol_",
        "Rebuttal": "R_",
        "Monitor": "M_"
    };
    DCaseNodeModel.prototype.getNodeCount = function () {
        return this.children.length + this.contexts.length;
    };
    DCaseNodeModel.prototype.eachChildren = function (f) {
        for(var i = 0; i < this.children.length; ++i) {
            f(i, this.children[i]);
        }
    };
    DCaseNodeModel.prototype.eachContexts = function (f) {
        for(var i = 0; i < this.contexts.length; ++i) {
            f(i, this.contexts[i]);
        }
    };
    DCaseNodeModel.prototype.eachContents = function (f) {
        for(var i = 0; i < this.metaContents.length; ++i) {
            f(i, this.metaContents[i]);
        }
    };
    DCaseNodeModel.prototype.eachSubNode = function (f) {
        this.eachContexts(f);
        this.eachChildren(f);
    };
    DCaseNodeModel.prototype.traverse = function (f) {
        var traverse_ = function (n, f) {
            n.eachSubNode(function (i, v) {
                f(i, v);
                traverse_(v, f);
            });
        };
        f(-1, this);
        traverse_(this, f);
    };
    DCaseNodeModel.prototype.deepCopy = function () {
        node:
DCaseNodeModel = new DCaseNodeModel(this.id, this.name, this.type, this.desc, this.metadata)
        this.eachNode(function (child) {
            node.insertChild(child.deepCopy());
        });
        return node;
    };
    DCaseNodeModel.prototype.insertChild = function (node, index) {
        a:
DCaseNodeModel = node.isContext ? this.contexts : this.children
        if(index == null) {
            index = a.length;
        }
        a.splice(index, 0, node);
        node.parents.push(this);
        this.updateFlags();
    };
    DCaseNodeModel.prototype.removeChild = function (node) {
        a:
DCaseNodeModel = node.isContext ? this.contexts : this.children
        i:
number = a.indexOf(node)
        a.splice(i, 1);
        node.parents.splice(node.parents.indexOf(this), 1);
        this.updateFlags();
    };
    DCaseNodeModel.prototype.updateFlags = function () {
        if(this.type == "Goal") {
            this.isArgument = this.contexts.length != 0;
            this.isUndeveloped = this.children.length == 0;
        }
    };
    DCaseNodeModel.prototype.getHtmlDescription = function () {
        if(this.desc == "") {
            return "<font color=\"gray\">(no description)</font>";
        } else {
            return this.desc.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        }
    };
    DCaseNodeModel.prototype.getHtmlMetadata = function () {
        var innerText = generateMetadata(this);
        var divText = "<div></div>";
        if(innerText != "") {
            divText = "<div>Metadata</div>";
        }
        return $(divText).append($("<font color=\"black\">" + innerText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") + "</font>")).addClass("node-text-metadata").css("background-color", "gray").css("opacity", "0.5");
    };
    DCaseNodeModel.prototype.appendableTypes = function () {
        return DCaseNodeModel.SELECTABLE_TYPES[this.type];
    };
    DCaseNodeModel.prototype.isTypeApendable = function (type) {
        return (DCaseNodeModel.SELECTABLE_TYPES[this.type].indexOf(type) != -1);
    };
    DCaseNodeModel.prototype.toJson = function () {
        var children = [];
        this.eachNode(function (node) {
            children.push(node.toJson());
        });
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.desc,
            metadata: this.metadata,
            children: children
        };
    };
    return DCaseNodeModel;
})();
var DCaseTree = (function () {
    function DCaseTree(tl, id, nodeCount) {
        this.NodeList = tl;
        this.TopGoalId = id;
        this.NodeCount = nodeCount;
    }
    return DCaseTree;
})();
var DCaseModel = (function () {
    function DCaseModel(tree, argId, commitId) {
        this.node = null;
        this.commitId = commitId;
        this.argId = argId;
        this.opQueue = [];
        this.undoCount = 0;
        this.nodeCound = 0;
        this.typeCount = {
        };
        this.view = [];
        types:
any = DCaseNodeModel.TYPES
        for(var i = 0; i < types.length; i++) {
            this.typeCount[types[i]] = 1;
        }
        this.decode(tree);
    }
    DCaseModel.prototype.decode = function (tree) {
        self:
DCaseModel = this
        nodes:
any = []
        for(var i = 0; i < tree.NodeList.length; i++) {
            c:
DCaseNodeModel = tree.NodeList[i]
            nodes[c.ThisNodeId] = c;
        }
        function create(id) {
            data:
DCaseNodeModel = nodes[id]
            type:
string = data.NodeType
            desc:
string = data.Description
            metadata:
DCaseMetaContent = data.Metadata ? data.Metadata : null
            node:
DCaseNodeModel = self.createNode(id, type, desc, metadata)
            for(var i = 0; i < data.Children.length; i++) {
                node.insertChild(create(data.Children[i]));
            }
            return node;
        }
        topId:
number = tree.TopGoalId
        this.node = create(topId);
        this.nodeCount = tree.NodeCount;
    };
    DCaseModel.prototype.encode = function () {
        tl:
any = []
        node:
DCaseNodeModel = this.node
        node.traverse(function (i, v) {
            c:
any = []
            node.eachSubNode(function (i, v) {
                c.push(node.id);
            });
            tl.push({
                ThisNodeId: node.id,
                NodeType: node.type,
                Description: node.desc,
                Metadata: node.metadata,
                Children: c
            });
        });
        return new DCaseTree(tl, node.id, this.nodeCount);
    };
    DCaseModel.prototype.isChanged = function () {
        return this.opQueue.length - this.undoCount > 0;
    };
    DCaseModel.prototype.getArgumentId = function () {
        return this.argId;
    };
    DCaseModel.prototype.getCommitId = function () {
        return this.commitId;
    };
    DCaseModel.prototype.getTopGoal = function () {
        return this.node;
    };
    DCaseModel.prototype.createNode = function (id, type, desc, metadata) {
        name:
string = DCaseNodeModel.NAME_PREFIX[type] + toString(id)
        return new DCaseNodeModel(id, name, type, desc, metadata);
    };
    DCaseModel.prototype.copyNode = function (node) {
        self:
DCaseModel = this
        newNode:
DCaseNodeModel = self.createNode(++this.nodeCount, node.type, node.desc, node.metadata)
        node.eachSubNode(function (i, v) {
            newNode.insertChild(self.copyNode(child));
        });
        return newNode;
    };
    DCaseModel.prototype.insertNode = function (parent, type, desc, metadata, index) {
        self:
DCaseModel = this
        if(index == null) {
            index = parent.children.length;
        }
        id:
number = ++this.nodeCount
        node:
DCaseNodeModel = this.createNode(id, type, desc, metadata)
        this.applyOperation({
            redo: function () {
                parent.insertChild(node, index);
                self.nodeInserted(parent, node, index);
            },
            undo: function () {
                parent.removeChild(node);
                self.nodeRemoved(parent, node, index);
            }
        });
        return node;
    };
    DCaseModel.prototype.pasteNode = function (parent, old_node, index) {
        self:
DCaseModel = this
        if(index == null) {
            index = parent.children.length;
        }
        node:
DCaseNodeModel = self.copyNode(old_node)
        this.applyOperation({
            redo: function () {
                parent.insertChild(node, index);
                self.structureUpdated();
            },
            undo: function () {
                parent.removeChild(node);
                self.structureUpdated();
            }
        });
    };
    DCaseModel.prototype.removeNode = function (node) {
        self:
DCaseModel = this
        parent:
DCaseNodeModel = node.parents[0]
        index:
number = parent.children.indexOf(node)
        this.applyOperation({
            redo: function () {
                parent.removeChild(node);
                self.nodeRemoved(parent, node, index);
            },
            undo: function () {
                parent.insertChild(node, index);
                self.nodeInserted(parent, node, index);
            }
        });
    };
    DCaseModel.prototype.setDescription = function (node, desc) {
        self:
DCaseNodeModel = this
        oldDesc:
string = node.desc
        this.applyOperation({
            redo: function () {
                node.desc = desc;
                self.nodeChanged(node);
            },
            undo: function () {
                node.desc = oldDesc;
                self.nodeChanged(node);
            }
        });
    };
    DCaseModel.prototype.updateTypeFlag = function (node) {
        node.isDScript = (node.type === "Solution");
        node.isContext = (node.type === "Context" || node.type === "Subject" || node.type === "Rebuttal");
    };
    DCaseModel.prototype.setType = function (node, type) {
        self:
DCaseNodeModel = this
        oldType:
string = node.type
        this.applyOperation({
            redo: function () {
                node.type = type;
                self.updateTypeFlag(node);
                self.nodeChanged(node);
            },
            undo: function () {
                node.type = oldType;
                self.updateTypeFlag(node);
                self.nodeChanged(node);
            }
        });
    };
    DCaseModel.prototype.setParam = function (node, type, name, desc, metadata) {
        self:
DCaseNodeModel = this
        oldType:
string = node.type
        oldName:
string = node.name
        oldDesc:
string = node.desc
        oldMetadata:
DCaseMetaContent = node.metadata
        node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
        this.applyOperation({
            redo: function () {
                node.type = type;
                node.name = name;
                node.desc = desc;
                node.metadata = metadata;
                node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
                self.updateTypeFlag(node);
                self.nodeChanged(node);
            },
            undo: function () {
                node.type = oldType;
                node.name = oldName;
                node.desc = oldDesc;
                node.metadata = oldMetadata;
                node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
                self.updateTypeFlag(node);
                self.nodeChanged(node);
            }
        });
    };
    DCaseModel.prototype.undo = function () {
        n:
number = this.opQueue.length
        if(n > this.undoCount) {
            this.undoCount++;
            op:
any = this.opQueue[n - this.undoCount]
            op.undo();
            return true;
        } else {
            return false;
        }
    };
    DCaseModel.prototype.redo = function () {
        if(this.undoCount > 0) {
            op:
any = this.opQueue[this.opQueue.length - this.undoCount]
            this.undoCount--;
            op.redo();
            return true;
        } else {
            return false;
        }
    };
    DCaseModel.prototype.applyOperation = function (op) {
        this.opQueue.splice(this.opQueue.length - this.undoCount, this.undoCount, op);
        this.undoCount = 0;
        op.redo();
    };
    DCaseModel.prototype.commit = function (msg) {
        tree:
DCaseTree = this.encode()
        r:
number = DCaseAPI.commit(tree, msg, this.commitId)
        this.commitId = r;
        this.undoCount = 0;
        this.opQueue = [];
        return true;
    };
    DCaseModel.prototype.addListener = function (view) {
        this.view.push(view);
    };
    DCaseModel.prototype.removeListener = function (view) {
        this.view.splice(this.view.indexOf(view), 1);
    };
    DCaseModel.prototype.structureUpdated = function () {
        $.each(this.view, function (i, view) {
            view.structureUpdated();
        });
    };
    DCaseModel.prototype.nodeInserted = function (parent, node, index) {
        $.each(this.view, function (i, view) {
            view.nodeInserted(parent, node, index);
        });
    };
    DCaseModel.prototype.nodeRemoved = function (parent, node, index) {
        $.each(this.view, function (i, view) {
            view.nodeRemoved(parent, node, index);
        });
    };
    DCaseModel.prototype.nodeChanged = function (node) {
        $.each(this.view, function (i, view) {
            view.nodeChanged(node);
        });
    };
    return DCaseModel;
})();
