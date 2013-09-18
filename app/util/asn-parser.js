var peg = require('./../public/assurejs/lib/ASNParser/peg');

var NodeType;
(function (NodeType) {
    NodeType[NodeType["Goal"] = 0] = "Goal";
    NodeType[NodeType["Context"] = 1] = "Context";
    NodeType[NodeType["Strategy"] = 2] = "Strategy";
    NodeType[NodeType["Evidence"] = 3] = "Evidence";
})(NodeType || (NodeType = {}));

var ASNParser = (function () {
    function ASNParser() {
    }
    ASNParser.prototype.parseNodeList = function (asn) {
        var obj = peg.parse(asn)[1];
        var node = [];
        var traverse = function (n) {
            var children = n.Children;
            n.Children = [];
            node.push(n);
            if (children) {
                children.forEach(function (c) {
                    traverse(c);
                });
            }
        };
        traverse(obj);
        return node;
    };
    ASNParser.prototype.parse = function (asn) {
        return peg.parse(asn)[1];
    };
    ASNParser.prototype.ConvertToASN = function (root, isSingleNode) {
        var encoded = (function (model, prefix) {
            var IndentToken = "    ";
            var ret = "";
            switch (model.Type) {
                case NodeType["Goal"]:
                    prefix += "*";
                    ret += (prefix + " " + model.Label);
                    break;
                default:
                    if (prefix == "")
                        prefix += "*";
                    ret += (prefix + " " + model.Label);
            }

            var anno_num = model.Annotations.length;
            if (anno_num != 0) {
                for (var i = 0; i < model.Annotations.length; i++) {
                    ret += (" @" + model.Annotations[i].Name);
                    if (model.Annotations[i].Body) {
                        ret += (" " + model.Annotations[i].Body);
                    }
                }
            }
            ret += "\n";

            if (model.Statement != "")
                ret += (model.Statement + "\n");

            for (var key in model.Notes) {
                var Note = model.Notes[key];
                ret += key + "::" + Note + "\n";
            }

            if (isSingleNode) {
                return ret;
            }

            if (ret.indexOf("\n") != ret.lastIndexOf("\n")) {
                ret += "\n";
            }

            for (var i = 0; i < model.Children.length; i++) {
                var child_model = model.Children[i];

                if (child_model.Type == NodeType["Context"]) {
                    ret += arguments.callee(child_model, prefix);
                    break;
                }
            }
            for (var i = 0; i < model.Children.length; i++) {
                var child_model = model.Children[i];
                if (child_model.Type != NodeType["Context"]) {
                    ret += arguments.callee(child_model, prefix);
                }
            }
            return ret;
        })(root, "");

        return encoded;
    };
    return ASNParser;
})();
exports.ASNParser = ASNParser;

