function outputError(o) {
    console.log("error: " + o);
}

var Xml2DCaseTree;
(function (Xml2DCaseTree) {
    var DCaseLink = (function () {
        function DCaseLink(source, target) {
            this.source = source;
            this.target = target;
        }
        return DCaseLink;
    })();
    Xml2DCaseTree.DCaseLink = DCaseLink;

    var Converter = (function () {
        function Converter() {
            this.nodes = {};
            this.links = {};
            this.nodeIdMap = {};
            this.NodeCount = 0;
        }
        Converter.prototype.addNodeIdToMap = function (IdText) {
            if (!(IdText in this.nodeIdMap)) {
                if (this.NodeCount == 0) {
                    this.rootNodeIdText = IdText;
                }

                this.nodeIdMap[IdText] = this.NodeCount;
                this.NodeCount += 1;
            }
        };

        Converter.prototype.makeTree = function (nodeIdText) {
            var thisNode = this.nodes[nodeIdText];

            for (var linkIdText in this.links) {
                var link = this.links[linkIdText];

                if (link.source == nodeIdText || link.target == nodeIdText) {
                    var childNodeIdText;

                    if (link.source == nodeIdText) {
                        childNodeIdText = link.target;
                    } else {
                        childNodeIdText = link.source;
                    }
                    delete this.links[linkIdText];

                    var childNode = this.nodes[childNodeIdText];

                    if (childNode.NodeType == "Context") {
                        var thisContextAddableNode = thisNode;
                        thisContextAddableNode.Contexts.push(childNode);
                    } else {
                        thisNode.Children.push(childNode);
                        this.makeTree(childNodeIdText);
                    }
                }
            }

            return thisNode;
        };

        Converter.prototype.parseXml = function (xmlText) {
            var self = this;

            $(xmlText).find("rootBasicNode").each(function (index, elem) {
                var xsiType = $(this).attr("xsi\:type");

                if (xsiType.split(":").length != 2) {
                    outputError("attr 'xsi:type' is incorrect format");
                }

                var NodeType = xsiType.split(":")[1];
                var IdText = $(this).attr("id");
                var Description = $(this).attr("desc");
                var NodeName = $(this).attr("name");

                self.addNodeIdToMap(IdText);

                var node = new DCaseTree[NodeType + "Node"](Description, null, self.nodeIdMap[IdText]);
                node.NodeName = NodeName;
                self.nodes[IdText] = node;

                return null;
            });

            $(xmlText).find("rootBasicLink").each(function (index, elem) {
                var IdText = $(this).attr("id");
                var source = $(this).attr("source").substring(1);
                var target = $(this).attr("target").substring(1);
                var link = new DCaseLink(source, target);

                self.links[IdText] = link;

                return null;
            });

            var rootNode = this.makeTree(this.rootNodeIdText);
            rootNode.NodeCount = this.NodeCount;
            rootNode.TopGoalId = 0;

            return rootNode;
        };
        return Converter;
    })();
    Xml2DCaseTree.Converter = Converter;
})(Xml2DCaseTree || (Xml2DCaseTree = {}));
