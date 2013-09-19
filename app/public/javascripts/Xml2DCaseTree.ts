///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='./DCaseTree.ts'/>

function outputError(o : any) : void {
		console.log("error: " + o);
}

module Xml2DCaseTree {
	export class DCaseLink {

		source : string;
		target : string;

		constructor(source : string, target : string) {
			this.source = source;
			this.target = target;
		}

	}

	export class Converter {

		DCaseName : string;
		nodes : any = {};
		links : any = {};
		nodeIdMap : any = {}; // node whose id is '0' is the root node
		NodeCount : number = 0;
		rootNodeIdText : string;

		constructor() {
		}

		addNodeIdToMap(IdText : string) : void {
			if(!(IdText in this.nodeIdMap)) {
				if(this.NodeCount == 0) {
					this.rootNodeIdText = IdText;
				}

				this.nodeIdMap[IdText] = this.NodeCount;
				this.NodeCount += 1;
			}
		}

		makeTree(nodeIdText : string) : DCaseTree.DCaseNode {
			var thisNode : DCaseTree.DCaseNode = this.nodes[nodeIdText];

			for(var linkIdText in this.links) {
				var link : DCaseLink = this.links[linkIdText];

				if(link.source == nodeIdText || link.target == nodeIdText) {
					var childNodeIdText : string;

					if(link.source == nodeIdText) {
						childNodeIdText = link.target;
					}
					else {
						childNodeIdText = link.source;
					}
					delete this.links[linkIdText];

					var childNode : DCaseTree.DCaseNode = this.nodes[childNodeIdText];

					if(childNode.NodeType == "Context") {
						var thisContextAddableNode : DCaseTree.ContextAddableNode = <DCaseTree.ContextAddableNode>thisNode;
						thisContextAddableNode.Contexts.push(<DCaseTree.ContextNode>childNode);
					}
					else {
						thisNode.Children.push(childNode);
						this.makeTree(childNodeIdText);
					}
				}
			}

			return thisNode;
		}

		parseXmlWeaver(xmlText: string): DCaseTree.TopGoalNode {
			var self : Converter = this;
			$($.parseXML(xmlText).getElementsByTagName("node")).each(function(index : any, elem : Element) : JQuery {
				var NodeType : string = $(this).attr("type");

				var IdText : string = $(this).attr("id");
				var Description : string = $(this.getElementsByTagName("description")).text();
				var NodeName : string = $(this).attr("name");

				self.addNodeIdToMap(IdText);

				if(NodeType == "Module") {
					NodeType = "Goal";
				}
				if(NodeType == "Monitor" || NodeType == "Undeveloped") {
					NodeType = "Evidence";
				}
				var node : DCaseTree.DCaseNode = new DCaseTree[NodeType + "Node"](Description, null, self.nodeIdMap[IdText]);
				node.NodeName = NodeName;
				self.nodes[IdText] = node;

				return null;
			});

			$($.parseXML(xmlText).getElementsByTagName("link")).each(function(index : any, elem : Element) : JQuery {
				var IdText : any = $(this).attr("id");
				var source : string = $(this).attr("source");
				var target : string = $(this).attr("target");
				var link : DCaseLink = new DCaseLink(source, target);

				self.links[IdText] = link;

				return null;
			});

			var rootNode : DCaseTree.TopGoalNode = <DCaseTree.TopGoalNode>this.makeTree(this.rootNodeIdText);
			rootNode.NodeCount = this.NodeCount;
			rootNode.TopGoalId = 0;

			return rootNode;
		}

		parseXml(xmlText : string) : DCaseTree.TopGoalNode {
			var self : Converter = this;

			if($(xmlText).find("rootBasicNode").length == 0) {
				return this.parseXmlWeaver(xmlText);
			}
			$(xmlText).find("rootBasicNode").each(function(index : any, elem : Element) : JQuery {
				var xsiType : string = $(this).attr("xsi\:type");

				if(xsiType.split(":").length != 2) {
					outputError("attr 'xsi:type' is incorrect format");
				}

				var NodeType : string = xsiType.split(":")[1];
				var IdText : string = $(this).attr("id");
				var Description : string = $(this).attr("desc");
				var NodeName : string = $(this).attr("name");

				self.addNodeIdToMap(IdText);

				var node : DCaseTree.DCaseNode = new DCaseTree[NodeType + "Node"](Description, null, self.nodeIdMap[IdText]);
				node.NodeName = NodeName;
				self.nodes[IdText] = node;

				return null;
			});

			$(xmlText).find("rootBasicLink").each(function(index : any, elem : Element) : JQuery {
				var IdText : any = $(this).attr("id");
				var source : string = $(this).attr("source").substring(1); // #abc -> abc
				var target : string = $(this).attr("target").substring(1); // #abc -> abc
				var link : DCaseLink = new DCaseLink(source, target);

				self.links[IdText] = link;

				return null;
			});

			var rootNode : DCaseTree.TopGoalNode = <DCaseTree.TopGoalNode>this.makeTree(this.rootNodeIdText);
			rootNode.NodeCount = this.NodeCount;
			rootNode.TopGoalId = 0;

			return rootNode;
		}

	}
}
