class DCaseMetaContent {
    constructor(public type: string, public text: string){ }
    clone(): DCaseMetaContent {
        return new DCaseMetaContent(this.type, this.text);
    }
}

class DCaseNodeModel {
    id: number;
    name: string;
    type: string;
    desc: string;
    metadata: DCaseMetaContent;
    children: DCaseNodeModel[];
    contexts: DCaseNodeModel[];
    parent: DCaseNodeModel;

    isContext: boolean = false;
               
    isArgument: boolean = false;
    isUndeveloped: boolean = false;
    isDScript: boolean = false;

    static TYPES = [
        "Goal", 
        "Context", 
        "Subject", 
        "Strategy", 
        "Evidence", 
        "Solution", 
        "Rebuttal", 
        "Monitor"
    ];

    static SELECTABLE_TYPES = {
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

    static NAME_PREFIX = {
        "Goal": "G_",
        "Context": "C_",
        "Subject": "Sub_",
        "Strategy": "S_",
        "Evidence": "E_",
        "Solution": "Sol_",
        "Rebuttal": "R_",
        "Monitor": "M_"
    };

    constructor (id: number, name: string, type: string, desc: string, metadata) { //FIXME
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

    getNodeCount(): number {
        return this.children.length + this.contexts.length;
    }

    eachChildren(f: (i: number, v: DCaseNodeModel) => void): void { //FIXME
        for(var i = 0; i < this.children.length; ++i){
            f(i, this.children[i]);
        }
    }

    eachContexts(f: (i: number, v: DCaseNodeModel) => void): void {
        for(var i = 0; i < this.contexts.length; ++i){
            f(i, this.contexts[i]);
        }
    }

    eachContents(f: (i: number, v: DCaseMetaContent) => void): void {
        for(var i = 0; i < this.metaContents.length; ++i){
            f(i, this.metaContents[i]);
        }
    }

    eachSubNode(f: (i: number, v: DCaseNodeModel) => void): void {
        this.eachContexts(f);
        this.eachChildren(f);
    }

    traverse(f: (i: number, v: DCaseNodeModel) => void): void {
        var traverse_ = (n: DCaseNodeModel, f: (i: number, v: DCaseNodeModel) => void)=>{
            n.eachSubNode((i, v)=>{
                    
                    f(i, v);
                    traverse_(v, f)
                    });
        }
        f(-1, this);
        traverse_(this, f);
    }

    deepCopy(): DCaseNodeModel { //FIXME
        node: DCaseNodeModel = new DCaseNodeModel(this.id, this.name, this.type, this.desc, this.metadata);
        this.eachNode(function (child) {
            node.insertChild(child.deepCopy());
        });
        return node;
    }

    insertChild(node: DCaseNodeModel, index: number): void {
        a: DCaseNodeModel = node.isContext ? this.contexts : this.children;
        if(index == null) {
            index = a.length;
        }
        a.splice(index, 0, node);
        node.parents.push(this);
        this.updateFlags();
    }

    removeChild(node: DCaseNodeModel): void {
        a: DCaseNodeModel = node.isContext ? this.contexts : this.children;
        i: number = a.indexOf(node);
        a.splice(i, 1);
        node.parents.splice(node.parents.indexOf(this), 1);
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
        var innerText = generateMetadata(this);
        var divText = "<div></div>";
        if(innerText != "") {
            divText = "<div>Metadata</div>";
        }
        return $(divText).append($("<font color=\"black\">" + innerText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") + "</font>")).addClass("node-text-metadata").css("background-color", "gray").css("opacity", "0.5");
    }

    appendableTypes(): string[] {
        return DCaseNodeModel.SELECTABLE_TYPES[this.type];
    }

    isTypeApendable(type: string): boolean {
        return (DCaseNodeModel.SELECTABLE_TYPES[this.type].indexOf(type) != -1);
    }

    toJson(): any {   //FIXME
        var children = [];
        this.eachNode(function (node) { 
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

class DCaseTree {
    NodeList: DCaseNodeModel[];
    TopGoalId: number;
    NodeCount: number;

    constructor(tl: DCaseNodeModel[], id: number, nodeCount: number) {
        this.NodeList = tl;
        this.TopGoalId = id;
        this.NodeCount = nodeCount;
    }
}

class DCaseModel {
    node: DCaseNodeModel;
    commitId: number;
    argId: number;
    opQueue: any;   //FIXME
    undoCount: number;
    nodeCount: number;
    typeCount: any;
    view: any;  //FIXME

    constructor(tree: DCaseTree, argId: number, commitId: number) { 
        this.node = null;
        this.commitId = commitId;
        this.argId = argId;
        this.opQueue = [];
        this.undoCount = 0;
        this.nodeCound = 0;
        this.typeCount = {};
        this.view = [];

        types: any = DCaseNodeModel.TYPES; 
        for(var i = 0; i < types.length; i++) {
            this.typeCount[types[i]] = 1;
        }
        this.decode(tree);
    }

    decode(tree: DCaseTree): void {
        // function contextParams(params) {
            // var s = "";
            // for(key in params) {
                // s += "@" + key + " : " + params[key] + "\n";
        
            // }
            // return s;
        // }

        self: DCaseModel = this;
        nodes: any = [];  //FIXME
        for(var i = 0; i < tree.NodeList.length; i++) {
            c: DCaseNodeModel = tree.NodeList[i];
            nodes[c.ThisNodeId] = c;
        }

        function create(id){ //FIXME
                data: DCaseNodeModel = nodes[id];
                type: string = data.NodeType;
                desc: string = data.Description;
                metadata: DCaseMetaContent = data.Metadata ? data.Metadata : null;
                node: DCaseNodeModel = self.createNode(id, type, desc, metadata);
            for(var i = 0; i < data.Children.length; i++) {
                node.insertChild(create(data.Children[i]));
            }
            return node;
        }

        topId: number = tree.TopGoalId;
        this.node = create(topId);
        this.nodeCount = tree.NodeCount;
    }

    encode(): DCaseTree {
        tl: any = [];  //FIXME
        node: DCaseNodeModel = this.node;
        node.traverse((0, node) => {
            var c = [];
            node.eachSubNode((0, node) => {
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
    }

    isChanged(): boolean {
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

    createNode(id: number, type: string, desc: string, metadata: DCaseMetaContent): DCaseNodeModel {
        name: string = DCaseNodeModel.NAME_PREFIX[type] + toString(id);
        return new DCaseNodeModel(id, name, type, desc, metadata);
    }

    copyNode(node: DCaseNodeModel) {
        self: DCaseModel = this;
        newNode: DCaseNodeModel = self.createNode(++this.nodeCount, node.type, node.desc, node.metadata);
        node.eachSubNode(function (0, child) {
            newNode.insertChild(self.copyNode(child));
        });
        return newNode;
    }

    insertNode(parent: DCaseNodeModel, type: string, desc: string, metadata: DCaseMetaContent, index: number): DCaseNodeModel {
        self: DCaseModel = this;
        if(index == null) {
            index = parent.children.length;
        }
        id: number = ++this.nodeCount;
        node: DCaseNodeModel = this.createNode(id, type, desc, metadata);
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
    }

    pasteNode(parent: DCaseNodeModel, old_node: DCaseNodeModel, index: number): void {
        self: DCaseModel = this;
        if(index == null) {
            index = parent.children.length;
        }
        node: DCaseNodeModel = self.copyNode(old_node);
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
    }

    removeNode(node: DCaseNodeModel): void {
        self: DCaseModel = this;
        parent: DCaseNodeModel = node.parents[0];
        index: number = parent.children.indexOf(node);
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
    }

    setDescription(node: DCaseNodeModel, desc: string): void {
        self:DCaseNodeModel  = this;
        oldDesc: string = node.desc;
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
    }

    updateTypeFlag(node: DCaseNodeModel): void {
        node.isDScript = (node.type === "Solution");
        node.isContext = (node.type === "Context" || node.type === "Subject" || node.type === "Rebuttal");
    }

    setType(node: DCaseNodeModel, type: string): void {
        self: DCaseNodeModel = this;
        oldType: string = node.type;
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
    }

    setParam(node: DCaseNodeModel, type: string, name: string, desc: string, metadata: DCaseMetaContent): void {
        self: DCaseNodeModel = this;
        oldType: string = node.type;
        oldName: string = node.name;
        oldDesc: string = node.desc;
        oldMetadata: DCaseMetaContent = node.metadata;
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
    }

    undo(): boolean {
        n: number = this.opQueue.length;
        if(n > this.undoCount) {
            this.undoCount++;
            op: any = this.opQueue[n - this.undoCount]; //FIXME
            op.undo();
            return true;
        } else {
            return false;
        }
    }

    redo(): boolean {
        if(this.undoCount > 0) {
            op: any = this.opQueue[this.opQueue.length - this.undoCount];   //FIXME
            this.undoCount--;
            op.redo();
            return true;
        } else {
            return false;
        }
    }

    applyOperation(op: any): void { //FIXME
        this.opQueue.splice(this.opQueue.length - this.undoCount, this.undoCount, op);
        this.undoCount = 0;
        op.redo();
    }

    commit(msg: string): boolean {  //FIXME
        tree: DCaseTree = this.encode();
        r: number = DCaseAPI.commit(tree, msg, this.commitId);
        this.commitId = r;
        this.undoCount = 0;
        this.opQueue = [];
        return true;
    }

    addListener(view: any): void {  //FIXME
        this.view.push(view);
    }

    removeListener(view: any): void {
        this.view.splice(this.view.indexOf(view), 1);
    }

    structureUpdated(): void {  //FIXME
        $.each(this.view, function (i, view) {
            view.structureUpdated();
        });
    }

    nodeInserted(parent: DCaseNodeModel, node: DCaseNodeModel, index: number): void {   //FIXME
        $.each(this.view, function (i, view) {
            view.nodeInserted(parent, node, index);
        });
    }

    nodeRemoved(parent: DCaseNodeModel, node: DCaseNodeModel, index: number): void {    //FIXME
        $.each(this.view, function (i, view) {
            view.nodeRemoved(parent, node, index);
        });
    }

    nodeChanged(node: DCaseNodeModel): void {   //FIXME
        $.each(this.view, function (i, view) {
            view.nodeChanged(node);
        });
    }; 
}

