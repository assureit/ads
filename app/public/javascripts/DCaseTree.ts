function outputText(text : string) : void {
	console.log(text);
}

module DCaseTree {
	export class DCaseNode {

		NodeType : string;
		NodeName : string;
		Description : string;
		Id : number;
		MetaData : any[];
		Children : DCaseNode[];

		constructor(NodeType : string, Description : string, MetaData : any, Id : number) {
			this.NodeType = NodeType;
			this.NodeName = null;
			this.Description = Description;
			this.MetaData = MetaData;
			this.Id = Id;
			this.Children = [];
		}

		convertAllChildNodeIntoJson(jsonData : any[]) : any[]{
			var elem : any = {};
			elem["NodeType"]   = this.NodeType;
			elem["Description"]= this.Description
			elem["ThisNodeId"] = this.Id;

			var childrenIds : number[] = [];
			for(var i : number = 0; i < this.Children.length ; i++) {
				childrenIds[i] = this.Children[i].Id;
			}
			elem["Children"] = childrenIds;

			elem["MetaData"] = this.MetaData;

			jsonData.push(elem);

			for(var j : number = 0; j < this.Children.length ; j++){
				this.Children[j].convertAllChildNodeIntoJson(jsonData);
			}

			return jsonData;
		}

		convertAllChildNodeIntoXml(linkArray : string [] ) : void {

			outputText("\t<rootBasicNode xsi:type=\"dcase:" + this.NodeType + "\" id=\""
				+ this.Id + "\" name=\"" + this.NodeName + "\" desc=\"" + this.Description + "\"/>");
		}

		convertAllChildNodeIntoMarkdown(goalNum : number) : void {
			var outputStr : string = "";
			var asterisk  : string = "";

			if(this.NodeType == "Goal"){
				goalNum++;
			}

			for(var i : number = 0; i < goalNum; i++){
				asterisk += "*";
			}

			outputStr += asterisk + this.NodeType + " " + this.NodeName + " " + this.Id;
			outputText(outputStr)
			outputText(this.Description);

			if(this.MetaData.length == 0){
				outputText("---");
			} else if (this.MetaData.length > 1) {
				for(var j : number = 0; j < this.MetaData.length; j++){
					outputText("---");
					for(var keyName in this.MetaData[j]){
						outputText(keyName + ": " + this.MetaData[j][keyName]);
					}
				}
			} else {
				outputText("---");
				for(var keyName in this.MetaData){
					outputText(keyName + ": " + this.MetaData[keyName]);
				}
			}
			outputText("---");

			for(var k : number = 0; k < this.Children.length; k++) {
				this.Children[k].convertAllChildNodeIntoMarkdown(goalNum);
			}
		}

		/* for debug */
		dump() : void {
			this.dumpAllChild(0);
		}

		dumpAllChild(depth : number) : void { // it is private method (don't use this)
			var data : string = "";
			for(var i : number = 0; i < depth; i++) {
				data += "\t";
			}
			data += this.NodeType + ":" + this.Id;
			console.log(data); // dump this node

			for(var i : number = 0; i < this.Children.length; i++) {
				this.Children[i].dumpAllChild(depth + 1);
			}
		}

	}

	export class SolutionNode extends DCaseNode {

		constructor(Description : string, MetaData : any, Id : number) {
			super("Solution", Description, MetaData, Id);
		}

	}

	export class EvidenceNode extends DCaseNode {

		constructor(Description : string, MetaData : any, Id : number) {
			super("Evidence", Description, MetaData, Id);
		}

	}

	export class ContextNode extends DCaseNode {

		constructor(Description : string, MetaData : any, Id : number) {
			super("Context", Description, MetaData, Id);
		}

		convertAllChildNodeIntoJson(jsonData : any[]): any[] {
			var elem : any  = {};
			elem["NodeType"]   = this.NodeType;
			elem["Description"]= this.Description;
			elem["ThisNodeId"] = this.Id;
			elem["MetaData"] = this.MetaData;
			elem["Children"] = [];

			jsonData.push(elem);
			return jsonData;
		}

		convertAllChildNodeIntoXml(linkArray : string[]) : void {

			var nodeStr : string = "\t<rootBasicNode xsi:type=\"dcase:" + this.NodeType + "\" id=\""
				+ this.Id + "\" name=\"" + this.NodeName + "\" desc=\"" + this.Description + "\"/>";
			outputText(nodeStr);

		}


		convertAllChildNodeIntoMarkdonw(goalNum : number) : void {
			var outputStr : string = "";
			var asterisk  : string = "";

			for(var i: number = 0; i < goalNum; i++){
				asterisk += "*";
			}

			outputStr += asterisk + this.NodeType + " " +
					this.NodeName + " " + this.Id;

			outputText(outputStr);
			outputText(this.Description);

			if(this.MetaData.length == 0){
				outputText("---");
			} else if (this.MetaData.length > 1) {
				for(var j : number = 0; j < this.MetaData.length; j++){
					outputText("---");
					for(var keyName in this.MetaData[j]){
						outputText(keyName + ": " + this.MetaData[j][keyName]);
					}
				}
			} else {
				outputText("---");
				for(var keyName in this.MetaData){
					outputText(keyName + ": " + this.MetaData[keyName]);
				}
			}
			outputText("---");
		}
	}

	export class RebbutalNode extends DCaseNode { // don't care

		constructor(Description : string, MetaData : any, Id : number) {
			super("Rebbutal", Description, MetaData, Id);
		}

	}

	export class ContextAddableNode extends DCaseNode {

		Contexts : ContextNode;

		constructor(NodeType : string, Description : string, MetaData : any[], Id : number) {
			super(NodeType, Description, MetaData, Id);
			this.Contexts = null;
		}


		convertAllChildNodeIntoJson(jsonData : any[]) : any[]{
			var elem : any = {};
			elem["NodeType"]   = this.NodeType;
			elem["Description"]= this.Description
			elem["ThisNodeId"] = this.Id;

			var childrenIds : number[] = [];
			for(var i : number = 0; i < this.Children.length ; i++) {
				childrenIds[i] = this.Children[i].Id;
			}
			elem["Children"] = childrenIds;

			if(this.Contexts != null) {
				elem["Contexts"] = this.Contexts.Id;
			}
			elem["MetaData"] = this.MetaData;

			jsonData.push(elem);

			if(this.Contexts != null) {
				this.Contexts.convertAllChildNodeIntoJson(jsonData);
			}

			for(var j : number = 0; j < this.Children.length ; j++){
				this.Children[j].convertAllChildNodeIntoJson(jsonData);
			}

			return jsonData;
		}


		convertAllChildNodeIntoXml(linkArray : string[]) : void {
			outputText("\t<rootBasicNode xsi:type=\"dcase:" + this.NodeType + "\" id=\""
				+ this.Id + "\" name=\"" + this.NodeName + "\" desc=\"" + this.Description + "\"/>");

			if(this.Contexts != null) {
				var linkContext : string = "\t<rootBasicLink xsi:type=\"dcase:link\" id=\"Undefined\""
					+ " source=\"" + this.Id + "\" target=\"#" + this.Contexts.Id + "\" name=\"Link_"
					+ (linkArray.length + 1) + "\"/>";

				linkArray.push(linkContext);

				this.Contexts.convertAllChildNodeIntoXml(linkArray);
			}

			for(var j : number = 0; j < this.Children.length; j++) {
				var linkChild : string = "\t<rootBasicLink xsi:type=\"dcase:link\" id=\"Undefined\""
					+ " source=\"" + this.Id + "\" target=\"#" + this.Children[j].Id + "\" name=\"Link_" 
					+ (linkArray.length + 1) + "\"/>";

				linkArray.push(linkChild);

				this.Children[j].convertAllChildNodeIntoXml(linkArray);
			}


		}

		convertAllChildNodeIntoMarkdown(goalNum : number) : void {
			var outputStr : string = "";
			var asterisk  : string = "";

			if(this.NodeType == "Goal"){
				goalNum++;
			}

			for(var i : number = 0; i < goalNum; i++){
				asterisk += "*";
			}

			outputStr += asterisk + this.NodeType + " " + this.NodeName + " " + this.Id;
			outputText(outputStr)
			outputText(this.Description);


			if(this.MetaData.length == 0){
				outputText("---");
			} else if (this.MetaData.length > 1){
				for(var j : number = 0; j < this.MetaData.length; j++){
					outputText("---");
					for(var keyName in this.MetaData[j]){
						outputText(keyName + ": " + this.MetaData[j][keyName]);
					}
				}
			} else {
				outputText("---");
				for(var keyName in this.MetaData){
					outputText(keyName + ": " + this.MetaData[keyName]);
				}
			}

			outputText("---");

			if(this.Contexts != null) {
				this.Contexts.convertAllChildNodeIntoMarkdown(goalNum);
			}

			for(var k : number = 0; k < this.Children.length; k++) {
				this.Children[k].convertAllChildNodeIntoMarkdown(goalNum);
			}
		}

		dumpAllChild(depth : number) : void { // it is private method (don't use this)
			var data : string = "";
			for(var i : number = 0; i < depth; i++) {
				data += "\t";
			}
			data += this.NodeType + ":" + this.Id;
			if(this.Contexts != null) {
				data += " (Contexts:" + this.Contexts.Id+ ")";
			}
			console.log(data); // dump this node


			for(var i : number = 0; i < this.Children.length; i++) {
				this.Children[i].dumpAllChild(depth + 1);
			}
		}

	}

	export class GoalNode extends ContextAddableNode {

		constructor(Description : string, MetaData : any, Id : number) {
			super("Goal", Description, MetaData, Id);
		}

	}

	export class TopGoalNode extends GoalNode {

		DCaseName : string;
		NodeCount : number;
		TopGoalId : number;

		constructor(DCaseName : string, NodeCount : number, Description : string, MetaData : any, Id : number) {
			super(Description, MetaData, Id);
			this.DCaseName = DCaseName;
			this.NodeCount = NodeCount;
			this.TopGoalId = Id;
		}


		convertAllChildNodeIntoJson(jsonData : any[]) : any[]{
			var jsonOutput : any[] = [];
			jsonOutput["DCaseName"] = this.DCaseName;
			jsonOutput["NodeCount"] = this.NodeCount;
			jsonOutput["TopGoalId"] = this.TopGoalId;
			jsonOutput["NodeList"]  = jsonData;

			var elem : any = {};
			elem["NodeType"]   = this.NodeType;
			elem["Description"]= this.Description
			elem["ThisNodeId"] = this.Id;

			var childrenIds : number[] = [];
			for(var i : number = 0; i < this.Children.length ; i++) {
				childrenIds[i] = this.Children[i].Id;
			}
			elem["Children"] = childrenIds;

			if(this.Contexts != null){
				elem["Contexts"] = this.Contexts.Id;
			}

			elem["MetaData"] = this.MetaData;

			jsonData.push(elem);

			if(this.Contexts != null) {
				this.Contexts.convertAllChildNodeIntoJson(jsonData);
			}

			for(var j : number = 0; j < this.Children.length; j++){
				this.Children[j].convertAllChildNodeIntoJson(jsonData);
			}

			return jsonOutput;
		}

		convertAllChildNodeIntoXml(linkArray : string[]) : void {
			var xmlStr : string;
			xmlStr =  "<dcase:Argument xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\""
			+ " xmlns:dcase=\"http://www.dependalopble-os.net/2010/03/dcase/\""
			+ " id=\"_6A0EENScEeKCdP-goLYu9g\">";

			outputText(xmlStr);
			outputText("\t<rootBasicNode xsi:type=\"dcase:" + this.NodeType + "\" id=\""
				+ this.Id + "\" name=\"" + this.NodeName + "\" desc=\"" + this.Description + "\"/>");

			if(this.Contexts != null) {
				var linkContext : string = "\t<rootBasicLink xsi:type=\"dcase:link\" id=\"Undefined\""
					+ " source=\"" + this.Id + "\" target=\"#" + this.Contexts.Id + "\" name=\"Link_"
					+ (linkArray.length + 1) + "\"/>";

				linkArray.push(linkContext);

				this.Contexts.convertAllChildNodeIntoXml(linkArray);
			}

			for(var j : number = 0; j < this.Children.length; j++) {
				var linkChild : string = "\t<rootBasicLink xsi:type=\"dcase:link\" id=\"Undefined\""
					+ " source=\"" + this.Id + "\" target=\"#" + this.Children[j].Id + "\" name=\"Link_" 
					+ (linkArray.length + 1) + "\"/>";

				linkArray.push(linkChild);

				this.Children[j].convertAllChildNodeIntoXml(linkArray);
			}

			for(var k : number = 0; k < linkArray.length; k++) {
				outputText(linkArray[k]);
			}

			outputText("</dcase:Argument>");
		}

		convertAllChildNodeIntoMarkdown(goalNum : number) : void {
			var outputStr : string = "";
			var asterisk  : string = "";

			if(this.NodeType == "Goal"){
				goalNum++;
			}

			for(var i : number = 0; i < goalNum; i++){
				asterisk += "*";
			}

			outputText("DCaseName: " + this.DCaseName + "\n");

			outputStr += asterisk + this.NodeType + " " + this.NodeName + " " + this.TopGoalId;
			outputText(outputStr)
			outputText(this.Description);


			if(this.MetaData.length == 0){
				outputText("---");
			} else if (this.MetaData.length >1){
				for(var j : number = 0; j < this.MetaData.length; j++){
					outputText("---");
					for(var keyName in this.MetaData[j]){
						outputText(keyName + ": " + this.MetaData[j][keyName]);
					}
				}
			} else {
				outputText("---");
				for(var keyName in this.MetaData){
					outputText(keyName + ": " + this.MetaData[keyName]);
				}
			}
			outputText("---");

			if(this.Contexts != null) {
				this.Contexts.convertAllChildNodeIntoMarkdown(goalNum);
			}

			for(var k : number = 0; k < this.Children.length; k++) {
				this.Children[k].convertAllChildNodeIntoMarkdown(goalNum);
			}
		}




	}

	export class StrategyNode extends ContextAddableNode {

		constructor(Description : string, MetaData, Id : number) {
			super("Strategy", Description, MetaData, Id);
		}

	}
}
