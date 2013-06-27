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
        this.parent = null;
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
        for(var i = 0; i < this.metadata.length; ++i) {
            f(i, this.metadata[i]);
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
        var node = new DCaseNodeModel(this.id, this.name, this.type, this.desc, this.metadata);
        this.eachSubNode(function (i, v) {
            node.insertChild(v.deepCopy(), i);
        });
        return node;
    };
    DCaseNodeModel.prototype.insertChild = function (node, index) {
        var a = node.isContext ? this.contexts : this.children;
        if(index == null) {
            index = a.length;
        }
        a.splice(index, 0, node);
        node.parent = this;
        this.updateFlags();
    };
    DCaseNodeModel.prototype.removeChild = function (node) {
        var a = node.isContext ? this.contexts : this.children;
        var i = a.indexOf(node);
        a.splice(i, 1);
        node.parent = null;
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
        var innerText = generateMetadata(this).join("\n");
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
        this.eachSubNode(function (i, node) {
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
        this.nodeCount = 0;
        this.typeCount = {
        };
        this.view = [];
        var types = DCaseNodeModel.TYPES;
        for(var i = 0; i < types.length; i++) {
            this.typeCount[types[i]] = 1;
        }
        this.decode(tree);
    }
    DCaseModel.prototype.decode = function (tree) {
        var self = this;
        var nodes = [];
        for(var i = 0; i < tree.NodeList.length; i++) {
            var c = tree.NodeList[i];
            nodes[c.ThisNodeId] = c;
        }
        var create = function (id) {
            var data = nodes[id];
            var type = data.NodeType;
            var desc = data.Description;
            var metadata = null;
            var metadata_raw = data.MetaData;
            if(metadata_raw instanceof Array) {
                metadata = metadata_raw;
            } else if(metadata_raw != null) {
                metadata = [
                    metadata_raw
                ];
            } else {
                metadata = [];
            }
            var node = self.createNode(id, type, desc, metadata);
            for(var i = 0; i < data.Children.length; i++) {
                node.insertChild(create(data.Children[i]), i);
            }
            return node;
        };
        var topId = tree.TopGoalId;
        this.node = create(topId);
        this.nodeCount = tree.NodeCount;
    };
    DCaseModel.prototype.encode = function () {
        var tl = [];
        var node = this.node;
        node.traverse(function (i, v) {
            var c = [];
            v.eachSubNode(function (i, v) {
                console.log(v.id);
                c.push(v.id);
            });
            tl.push({
                ThisNodeId: v.id,
                NodeType: v.type,
                Description: v.desc,
                MetaData: v.metadata,
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
        var name = DCaseNodeModel.NAME_PREFIX[type] + id.toString();
        return new DCaseNodeModel(id, name, type, desc, metadata);
    };
    DCaseModel.prototype.copyNode = function (node) {
        var self = this;
        var newNode = self.createNode(++this.nodeCount, node.type, node.desc, node.metadata);
        node.eachSubNode(function (i, v) {
            newNode.insertChild(self.copyNode(v), i);
        });
        return newNode;
    };
    DCaseModel.prototype.insertNode = function (parent, type, desc, metadata, index) {
        var _this = this;
        if(index == null) {
            index = parent.children.length;
        }
        var id = ++this.nodeCount;
        var node = this.createNode(id, type, desc, metadata);
        this.applyOperation({
            redo: function () {
                parent.insertChild(node, index);
                _this.nodeInserted(parent, node, index);
            },
            undo: function () {
                parent.removeChild(node);
                _this.nodeRemoved(parent, node, index);
            }
        });
        return node;
    };
    DCaseModel.prototype.pasteNode = function (parent, old_node, index) {
        var _this = this;
        if(index == null) {
            index = parent.children.length;
        }
        var node = this.copyNode(old_node);
        this.applyOperation({
            redo: function () {
                parent.insertChild(node, index);
                _this.structureUpdated();
            },
            undo: function () {
                parent.removeChild(node);
                _this.structureUpdated();
            }
        });
    };
    DCaseModel.prototype.removeNode = function (node) {
        var _this = this;
        var parent = node.parent;
        var index = parent.children.indexOf(node);
        this.applyOperation({
            redo: function () {
                parent.removeChild(node);
                _this.nodeRemoved(parent, node, index);
            },
            undo: function () {
                parent.insertChild(node, index);
                _this.nodeInserted(parent, node, index);
            }
        });
    };
    DCaseModel.prototype.setDescription = function (node, desc) {
        var _this = this;
        var oldDesc = node.desc;
        this.applyOperation({
            redo: function () {
                node.desc = desc;
                _this.nodeChanged(node);
            },
            undo: function () {
                node.desc = oldDesc;
                _this.nodeChanged(node);
            }
        });
    };
    DCaseModel.prototype.updateTypeFlag = function (node) {
        node.isDScript = (node.type === "Solution");
        node.isContext = (node.type === "Context" || node.type === "Subject" || node.type === "Rebuttal");
    };
    DCaseModel.prototype.setType = function (node, type) {
        var _this = this;
        var oldType = node.type;
        this.applyOperation({
            redo: function () {
                node.type = type;
                _this.updateTypeFlag(node);
                _this.nodeChanged(node);
            },
            undo: function () {
                node.type = oldType;
                _this.updateTypeFlag(node);
                _this.nodeChanged(node);
            }
        });
    };
    DCaseModel.prototype.setParam = function (node, type, name, desc, metadata) {
        var _this = this;
        var oldType = node.type;
        var oldName = node.name;
        var oldDesc = node.desc;
        var oldMetadata = node.metadata;
        node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
        this.applyOperation({
            redo: function () {
                node.type = type;
                node.name = name;
                node.desc = desc;
                node.metadata = metadata;
                node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
                _this.updateTypeFlag(node);
                _this.nodeChanged(node);
            },
            undo: function () {
                node.type = oldType;
                node.name = oldName;
                node.desc = oldDesc;
                node.metadata = oldMetadata;
                node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
                _this.updateTypeFlag(node);
                _this.nodeChanged(node);
            }
        });
    };
    DCaseModel.prototype.undo = function () {
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
    DCaseModel.prototype.redo = function () {
        if(this.undoCount > 0) {
            var op = this.opQueue[this.opQueue.length - this.undoCount];
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
        var tree = this.encode();
        var r = DCaseAPI.commit(tree, msg, this.commitId);
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
