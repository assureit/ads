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
var ResponseSource = (function () {
    function ResponseSource() {
        this.stack = [];
        this.src = "";
        this.header = "";
    }
    ResponseSource.prototype.printlnHeader = function (s) {
        this.header += s + '\n';
    };
    ResponseSource.prototype.print = function (s, i) {
        if(i == null) {
            this.src += s;
        } else {
            this.stack[i] += s;
        }
    };
    ResponseSource.prototype.println = function (s, i) {
        if(i == null) {
            this.src += s + '\n';
        } else {
            this.stack[i] += s + '\n';
        }
    };
    ResponseSource.prototype.push = function () {
        var ret = this.stack.push(this.src);
        this.src = "";
        return ret - 1;
    };
    ResponseSource.prototype.emit = function () {
        var ret = this.header;
        ret += this.src;
        for(var i = this.stack.length - 1; i >= 0; i--) {
            ret += this.stack[i];
        }
        return ret;
    };
    return ResponseSource;
})();
exports.ResponseSource = ResponseSource;
var DScriptExporter = (function (_super) {
    __extends(DScriptExporter, _super);
    function DScriptExporter() {
        _super.call(this);
        this.res = new ResponseSource();
        this.goalIndex = 0;
    }
    DScriptExporter.prototype.FindById = function (id) {
        for(var i = 0; i < this.nodeList.length; i++) {
            var node = this.nodeList[i];
            var thisId = node.ThisNodeId;
            if(node.ThisNodeId == id) {
                return node;
            }
        }
        return null;
    };
    DScriptExporter.prototype.GetContextData = function (Children) {
        var ret = {
        };
        for(var i = 0; i < Children.length; i++) {
            var node = this.FindById(Children[i]);
            if(node.NodeType == 'Context') {
            }
        }
        return ret;
    };
    DScriptExporter.prototype.GenerateStrategyCode = function (id) {
        var node = this.FindById(id);
        if(node == null) {
            return;
        }
        var ret = [];
        var context = this.GetContextData(node.Children);
        for(var i = 0; i < node.Children.length; i++) {
            var c = this.FindById(node.Children[i]);
            if(c != null) {
                if(c.NodeType == 'Goal') {
                    this.GenerateGoalCode(node.Children[i]);
                    ret.push(node.Children[i]);
                }
            }
        }
        return ret;
    };
    DScriptExporter.prototype.GenerateGoalCode = function (id) {
        var node = this.FindById(id);
        if(node == null) {
            return;
        }
        this.res.print("");
        var indent = this.res.push();
        this.res.println("boolean Goal_" + id + "() {", indent);
        for(var i = 0; i < node.Children.length; i++) {
            var c = this.FindById(node.Children[i]);
            if(c != null) {
                if(c.NodeType == 'Strategy') {
                    var subGoalIds = this.GenerateStrategyCode(node.Children[i]);
                    var run = "    return ";
                    for(var i = 0; i < subGoalIds.length; i++) {
                        run += "Goal_" + subGoalIds[i] + "() && ";
                    }
                    run = run.slice(0, -4) + ";";
                    this.res.println(run, indent);
                } else if(c.NodeType == 'Evidence') {
                    this.res.println('    return true;', indent);
                } else if(c.NodeType == 'Solution') {
                    this.res.println("    try {", indent);
                    var l = c.Description.split("\n");
                    for(var i = 0; i < l.length; i++) {
                        if(l[i].match("    ")) {
                            this.res.println('    ' + l[i], indent);
                        } else {
                            this.res.println('    //' + l[i], indent);
                        }
                    }
                    this.res.println("    } catch(Exception e) {", indent);
                    this.res.println("        Syslog.write(e.printStackTrace);", indent);
                    this.res.println("        return false;", indent);
                    this.res.println("    }", indent);
                    this.res.println("    return true;", indent);
                }
            }
        }
        this.res.println("}", indent);
        this.res.println('', indent);
    };
    DScriptExporter.prototype.export = function (m) {
        var json = JSON.parse(m).contents;
        this.nodeList = json.NodeList;
        this.root = this.FindById(json.TopGoalId);
        this.res.printlnHeader("//D-Script Generator v0.1");
        this.res.printlnHeader('');
        this.res.printlnHeader("//" + this.root.Description.replace("\n", "").replace("\r", ""));
        this.res.printlnHeader('');
        this.GenerateGoalCode(json.TopGoalId);
        return this.res.emit();
    };
    return DScriptExporter;
})(Exporter);
exports.DScriptExporter = DScriptExporter;
