var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Exporter = (function () {
    function Exporter() {
    }
    Exporter.prototype.emit = function (m) {
        return '';
    };
    return Exporter;
})();
exports.Exporter = Exporter;
function FindById(nodeList, id) {
    for(var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];
        var thisId = node.ThisNodeId;
        if(node.ThisNodeId == id) {
            return node;
        }
    }
    return null;
}
var ResponseSource = (function () {
    function ResponseSource() {
        this.src = "";
    }
    ResponseSource.prototype.print = function (s) {
        this.src += s;
    };
    ResponseSource.prototype.println = function (s) {
        this.src += s;
        this.src += '\n';
    };
    ResponseSource.prototype.emit = function () {
        return this.src;
    };
    return ResponseSource;
})();
exports.ResponseSource = ResponseSource;
var DScriptExporter = (function (_super) {
    __extends(DScriptExporter, _super);
    function DScriptExporter() {
        _super.call(this);
        this.res = new ResponseSource();
        this.solutionIndex = 0;
        this.goalContent = "";
    }
    DScriptExporter.prototype.EmitIndent = function (level) {
        var ret = "";
        for(var i = 0; i < level; i++) {
            ret += "    ";
        }
        return ret;
    };
    DScriptExporter.prototype.GenerateGoalCode = function (nodeList, nodeId, level) {
        var root = FindById(nodeList, nodeId);
        var children = root.Children;
        var indent = this.EmitIndent(level);
        if(root.NodeType == "Solution") {
            this.res.println("boolean Solution_" + this.solutionIndex + "() {");
            this.res.println("    //" + this.goalContent);
            this.res.println("    try {");
            var l = root.Description.split("\n");
            for(var i = 0; i < l.length; i++) {
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
            this.res.println("//" + root.NodeType + ":" + root.Description);
        }
        for(var i = 0; i < children.length; i++) {
            this.GenerateGoalCode(nodeList, children[i], 0);
        }
    };
    DScriptExporter.prototype.export = function (m) {
        m = JSON.parse(m);
        var tree = m.contents;
        var rootId = tree.TopGoalId;
        var nodeList = tree.NodeList;
        var indent = this.EmitIndent(0);
        var rootNode = FindById(nodeList, rootId);
        this.res.println("//D-Script Generator v0.1");
        this.res.println("//" + rootNode.Description.replace("\n", "").replace("\r", ""));
        this.res.println('');
        for(var i = 0; i < rootNode.Children.length; i++) {
            this.GenerateGoalCode(nodeList, rootNode.Children[i], 0);
        }
        var run = "";
        for(var i = 0; i < this.solutionIndex; i++) {
            run += "Solution_" + i + "() && ";
        }
        run = run.slice(0, -4) + ";";
        this.res.println(run);
        return this.res.emit();
    };
    return DScriptExporter;
})(Exporter);
exports.DScriptExporter = DScriptExporter;
