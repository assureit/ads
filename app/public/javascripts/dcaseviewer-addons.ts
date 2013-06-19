///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

function levenshtein(s1: any, s2: any): number {
	// http://kevin.vanzonneveld.net
	// +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	// +            bugfixed by: Onno Marsman
	// +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
	// + reimplemented by: Brett Zamir (http://brett-zamir.me)
	// + reimplemented by: Alexander M Beedie
	// *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
	// *                returns 1: 3

	if (s1 == s2) {
		return 0;
	}

	var s1_len: number = s1.length;
	var s2_len: number = s2.length;
	if (s1_len === 0) {
		return s2_len;
	}
	if (s2_len === 0) {
		return s1_len;
	}

	// BEGIN STATIC
	var split: bool = false;
	try{
		split=!('0')[0];
	} catch (e){
		split=true; // Earlier IE may not support access by string index
	}
	// END STATIC
	if (split){
		s1 = s1.split('');
		s2 = s2.split('');
	}

	var v0: number[] = new Array(s1_len+1);
	var v1: number[] = new Array(s1_len+1);

	var s1_idx: number = 0, s2_idx: number = 0, cost: number = 0;
	for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) {
		v0[s1_idx] = s1_idx;
	}
	var char_s1: string = '', char_s2: string = '';
	for (s2_idx=1; s2_idx<=s2_len; s2_idx++) {
		v1[0] = s2_idx;
		char_s2 = s2[s2_idx - 1];

		for (s1_idx=0; s1_idx<s1_len;s1_idx++) {
			char_s1 = s1[s1_idx];
			cost = (char_s1 == char_s2) ? 0 : 1;
			var m_min: number = v0[s1_idx+1] + 1;
			var b: number = v1[s1_idx] + 1;
			var c: number = v0[s1_idx] + cost;
			if (b < m_min) {
				m_min = b; }
			if (c < m_min) {
				m_min = c; }
			v1[s1_idx+1] = m_min;
		}
		var v_tmp: number[] = v0;
		v0 = v1;
		v1 = v_tmp;
	}
	return v0[s1_len];
}

function findMostSimilarNodeType(query: string): string {
	var NodeTypes: string[] = ["Goal", "Context", "Subject", "Strategy", "Evidence", "Rebuttal", "Solution", "Monitor"];

	query = query.toLowerCase();
	if(query.charAt(0) === "s"){
		if(query.charAt(1) === "u"){
			return "Subject";
		}else if(query.charAt(1) === "t"){
			return "Strategy";
		}else if(query.charAt(1) === "o"){
			return "Solution";
		}
	}else if(query.charAt(0) === "g"){
		return "Goal";
	}else if(query.charAt(0) === "r"){
		return "Rebuttal";
	}else if(query.charAt(0) === "c"){
		return "Context";
	}else if(query.charAt(0) === "e"){
		return "Evidence";
	}else if(query.charAt(0) === "m"){
		return "Monitor";
	}

	var min: number = levenshtein(NodeTypes[0], query);
	var minidx: number = 0;
	for(var i: number = 1; i < NodeTypes.length; i++){
		var d: number = levenshtein(NodeTypes[i], query);
		if(min >= d){
			minidx = i;
		}
	}
	return NodeTypes[minidx];
};

function DNodeView_ExpandBranch(self): void {
	var DBLTOUCH_THRESHOLD: number = 300;
	var count: number = 0;
	var time: number = null;

	self.$div.dblclick((e: JQueryEventObject) => {
		self.viewer.expandBranch(self);
	});

	self.$div.bind("touchstart", (e: any) => {
		var touches: string = e.originalEvent.touches;
		count = touches.length;
	});
	
	self.$div.bind("touchend", (e: JQueryEventObject) => {
		self.viewer.dragEnd(self);
		if(time != null && (e.timeStamp - time) < DBLTOUCH_THRESHOLD) {
			self.viewer.expandBranch(self);
			time = null;
		}
		if(count == 1) {
			time = e.timeStamp;
		} else {
			time = null;
		}
	});
};

//-----------------------------------------------------------------------------

/* find first line appering key value structure */
function checkKeyValue(str: string): bool {
	return str.indexOf(":") != -1;
}

function findVaridMetaData(body: string[]): number {
	body = body.join("\n").trim().split("\n");

	if (checkKeyValue(body[0])) {
		return 0;
	}

	var emptyLineIndex: number;
	for (emptyLineIndex = 0; emptyLineIndex < body.length; emptyLineIndex++) {
		if (body[emptyLineIndex] == "") {
			while (emptyLineIndex+1 < body.length && body[emptyLineIndex+1] == "") {
				emptyLineIndex++;
			}
			break;
		}
	}

	if (emptyLineIndex < body.length-1 && checkKeyValue(body[emptyLineIndex+1])) {
		return emptyLineIndex+1;
	}

	return -1;
}


function parseMetaData(data: string[]): any {
	var metadata: any = {};
	var i: number = 0;
	for (; i < data.length; i++) {
		if (data[i].indexOf(":") == -1) break;
		var list: string[] = data[i].split(":");
		var key: string = list[0].trim();
		var value: string = list.slice(1).join("").trim();
		metadata[key] = value;
	}
	if (i < data.length) {
		metadata["Description"] = data.slice(i).join("\n");
	} else {
		metadata["Description"] = "";
	}
	return metadata;
}

function generateMetadata(n): string {
	var metadata: any = n.metadata;
	var list = [];
	for (var i = 0; i < metadata.length; i++) {
		var keys: string[] = Object.keys(metadata[i]);
		var data: string = (keys.length > 0) ? "\n" : "";
		for (var j = 0; j < keys.length; j++) {
			var key: string = keys[j];
			if (key != "Description") {
				data += key + ": " + metadata[i][key] + "\n";
			}
		}
		if (metadata[i]["Description"]) {
			data += metadata[i]["Description"];
		} else {
			data = data.substr(0, data.length-1);
		}
		list.push(data);
	}
	return list;
}

function parseNodeBody(body: string[]): any {
	var metadata: any = {};
	var description: string;
	var metadataIndex: number = findVaridMetaData(body);
	if (metadataIndex != -1) {
		description = body.slice(0, metadataIndex).join("\n");
		metadata = parseMetaData(body.slice(metadataIndex));
	} else {
		description = body.join("\n").trim();
	}

	return {"description": description, "metadata": [metadata]}; //FIXME 
}

function DNodeView_InplaceEdit(self): void {
	var $edit: JQuery = null;

	self.$divText.addClass("node-text-editable");


	function generateMarkdownText(node: any): string {
		function convert(n: any): string {
			return ("# " + n.type + " " + n.name + " " + n.id + (n.desc.length > 0 ? ("\n" + n.desc) : "") + generateMetadata(n) + "\n\n");
		};

		var markdown: string = convert(node);
		node.eachSubNode((i: number, n: DCaseNodeModel) => {
			markdown = markdown + convert(n);
		});
		return markdown;
	};

	function parseMarkdownText(src: string): any[] {
		var nodesrc: string[] = src.split(/^#+/m).slice(1);
		var nodes: any[] = [];
		for(var i: number = 0; i < nodesrc.length; ++i){

			var lines: string[] = nodesrc[i].split(/\r\n|\r|\n/);
			var heads: string[] = lines[0].trim().split(/\s+/);

			/* handle metadata */
			var body: string[] = lines.slice(1).join("\n").trim().split("\n");
			var parsedBody: any = parseNodeBody(body);

			var node: DCaseNodeModel = new DCaseNodeModel(
				heads[2],
				heads[1],
				findMostSimilarNodeType(heads[0]),
				parsedBody.description,
				parsedBody.metadata
			);
			nodes.push(node);
		};
		return nodes;
	};

	function showInplace(): void {
		if($edit == null) {
			var cc: number = 0;
			self.$divText.css("display", "none");
			self.viewer.$root.css("-moz-user-select", "text");
			self.viewer.canMoveByKeyboard = false;

			$edit = $("<textarea></textarea>")
				.addClass("node-inplace")
				.autosize()
				.css("top", self.$divText.offset().y)
				.attr("value", generateMarkdownText(self.node))
				.appendTo(self.$div)
				.focus()
				.mousedown((e: JQueryEventObject) => { e.stopPropagation(); })
				.mousewheel((e: JQueryEventObject) => { e.stopPropagation(); })
				.dblclick((e: JQueryEventObject) => {
					if(cc >= 2) e.stopPropagation();
					cc = 0;
				})
				.click((e: JQueryEventObject) => { cc++; e.stopPropagation(); })
				.blur(closingInplace)
				.trigger("autosize")
				.on("keydown", (e: JQueryEventObject) => {
					if(e.keyCode == 27 /* ESC */){ e.stopPropagation(); closingInplace(); };
				});
		}
	}

	function updateNode(node: any, nodejson: any): any {
		var newDesc: string = nodejson.desc;
		var newType: string = nodejson.type;
		var newName: string = nodejson.name || newType[0] + "_" + node.id;
		var newMetadata: any = nodejson.metadata;
		var DCase = self.viewer.getDCase();
		DCase.setParam(node, newType, newName, newDesc, newMetadata);
		return node;
	}

	function closingInplace(): void {
		var markdown: string = $edit.attr("value").trim();
		var nodes: any[] = parseMarkdownText(markdown);
		var node: any = self.node;
		var viewer = self.viewer;
		var DCase = viewer.getDCase();
		var parent = node.parent;
		
		viewer.canMoveByKeyboard = true;
				
		if(nodes.length === 0){
			// plain-text is given.
			if(markdown.length === 0){
				// if an empty text is given, remove the node. (except top goal)
				DCase.removeNode(node);
				if(DCase.getTopGoal() !== node){
					viewer.centerize(parent, 0);
					closeInplace();
				}else{
					DCase.setDescription(node, "");
					node.eachSubNode((i: number, n: DCaseNodeModel) => {
						DCase.removeNode(n);
					});
				}
			}else{
				// if a plain-text is given, just set to the description.
				DCase.setDescription(node, markdown);
			}
		}else{
			// markdown-text is given.
			if(DCase.getTopGoal() === node){
				nodes[0].type = "Goal";
			}
			updateNode(node, nodes[0]);
			
			var idNodeTable: any = {};
			var idIndexTable: any = {};

			var ch: number = 0, co: number = 0;
			node.eachSubNode((i: number, n: DCaseNodeModel) => {
				idNodeTable[n.id] = n;
				if(n.isContext){
					idIndexTable[n.id] = co++;
				}else{
					idIndexTable[n.id] = ch++;
				}
			});

			var newChildren: any[] = [];
			var newContexts: string[] = [];

			var treeChanged: bool = false;
			for(var i: number = 1; i < nodes.length; ++i){
				var nd: any = nodes[i];
				var id: string = nd.id;
				if(idNodeTable[id]){
					if(!node.isTypeApendable(nd.type)){
						nd.type = idNodeTable[id].type;
					}
					var newNode: any = updateNode(idNodeTable[id], nd);
					// check subnode swapping
					treeChanged = idIndexTable[id] !== (newNode.isContext ? newContexts : newChildren).length;
					delete idNodeTable[id];
					(newNode.isContext ? newContexts : newChildren).push(newNode);
				}else if(node.isTypeApendable(nd.type)){
					// create new node
					var newNode: any = DCase.insertNode(node, nd.type, nd.desc, nd.metadata);
					treeChanged = true;
					(newNode.isContext ? newContexts : newChildren).push(newNode);
				}
			}
			// if a node is left in Table, it means that the node is removed from markdown text.
			jQuery.each(idNodeTable, (i, v) => {
				DCase.removeNode(v);
				treeChanged = true;
			});
			node.children = newChildren;
			node.contexts = newContexts;
			if(DCase.getTopGoal() === node){
				viewer.structureUpdated();
			}else{
				// FIXME: find more efficient way.
				viewer.structureUpdated();
			}
			if(treeChanged){
				viewer.centerize(node, 0);
			}else{
				viewer.setSelectedNode(viewer.getNodeView(node));
			}
		};
		closeInplace();
	};

	function closeInplace(): void {
		if($edit != null) {
			$edit.remove();
			$edit = null;
			self.$divText.css("display", "block");
			self.viewer.$root.css("-moz-user-select", "none");
		}
	}

	self.$divText.click(() => {
		showInplace();
	});
	
	self.$div.dblclick((e: JQueryEventObject) => {
		closeInplace();
	})
	
	self.startInplaceEdit = () => {
		showInplace();
	};

};

//-----------------------------------------------------------------------------

function DNodeView_ToolBox(self): void {
	var edit_lock: bool = false;
	var edit_hover: bool = false;
	var edit_active: bool = false;
	var $edit: JQuery = null;
	var timeout = null;

	function showNewNode(visible): void {
		var type_selected = null;
		function edit_close(): void {
			$edit.remove();
			$edit = null;
			self.viewer.canMoveByKeyboard = true;
			self.viewer.$root.css("-moz-user-select", "text");
		}
		function edit_activate(): void {
			if(!edit_active) {
				self.viewer.canMoveByKeyboard = false;
				edit_active = true;
				edit_lock = true;
				$edit.css("opacity", 0.95);
				self.viewer.$root.css("-moz-user-select", "text");
				self.viewer.$root.one("click", () => {
					var text = $edit.find("textarea").attr("value");
					if(text != "") {
						var parsedBody: any = parseNodeBody(text.trim().split("\n"));
						self.viewer.getDCase().insertNode(self.node, type_selected, parsedBody.description, parsedBody.metadata);
					}
					edit_close();
				});
			}
		}
		function clear_timeout(): void {
			if(timeout != null) {
				clearTimeout(timeout);
				timeout = null;
			}
		}
		if(visible) {
			var types = self.node.appendableTypes();
			if(self.node.contexts.length > 0) {
				types = types.slice(0);//clone
				for(var i: number = 0; i < self.node.contexts.length; i++) {
					types.splice(types.indexOf(self.node.contexts[i].type), 1);
				}
			}
			if($edit == null && types.length > 0) {
				// create
				$edit = $("#edit-newnode").clone()
				.css({
					display: "block",
					left: 0, top: self.$div.height(),
					opacity: 0.6,
				})
				.hover(() => {
					edit_hover = true;
					clear_timeout();
				}, () => {
					edit_hover = false;
					showNewNode(false);
				})
				.one("click", () => { edit_activate(); })
				.click((e: JQueryEventObject) => { e.stopPropagation(); })
				.appendTo(self.$div);

				var $ul: JQuery = $edit.find("ul");
				$.each(types, (i, type) => {
					var $li = $("<li></li>")
						.html("<a href=\"#\">" + type + "</a>")
						.click(() => {
							type_selected = type;
							$("li").removeClass("active");
							$li.addClass("active");
							$("textarea").focus();
						})
						.appendTo($ul);
					if(i == 0) {
						$li.addClass("active");
						type_selected = type;
					}
				});
				$edit.find("textarea")
					.focus()
					.mousedown((e: JQueryEventObject) => { e.stopPropagation(); })
					.mousewheel((e: JQueryEventObject) => { e.stopPropagation(); })
					.dblclick((e: JQueryEventObject) => { e.stopPropagation(); })
					.one("keydown", () => { edit_activate(); });

				$edit.ready(() => {
					$("textarea").css("height", $ul.height());
				});

				edit_lock = false;
				edit_hover = false;
				edit_active = false;
			}
			clear_timeout();
		} else if($edit != null) {
			if(!edit_lock && !edit_hover) {
				if(timeout == null) {
					timeout = setTimeout(() => {
						edit_close();
					}, 100);
				}
			}
		}
	};

	var $toolbox = null;
	
	function showToolbox(visible): void {
		if(visible) {
			if($toolbox != null) return;
			$toolbox = $("<div></div>")
				.css("display", self.$divText.css("display"))
				.appendTo(self.$div);
	
			$("<a href=\"#\"></a>").addClass("icon-plus")
				.css({ position: "absolute",bottom: 4, left: 4, })
				.hover(() => {
					showNewNode(true);
				}, () => {
					showNewNode(false);
				})
				.appendTo($toolbox);
	
			var $menu: JQuery = $("#edit-menulist").clone()
				.css({ position: "absolute",bottom: 4, left: 24, display: "block" })
				.appendTo($toolbox);

			$menu.find("#ml-cut").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.clipboard = self.node.deepCopy();
				self.viewer.getDCase().removeNode(self.node);
				console.log("cut");
			});

			$menu.find("#ml-copy").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.clipboard = self.node.deepCopy();
				console.log("copied");
			});

			$menu.find("#ml-paste").click((e: JQueryEventObject) => {
				e.preventDefault();
				var node: any = self.viewer.clipboard;
				if(node != null) {
					if(self.node.isTypeApendable(node.type)) {
						self.viewer.getDCase().pasteNode(self.node, node);
						console.log("pasted");
					} else {
						alert("そのタイプは貼付けられません");
					}
				}
			});

			if(self.node.parent != null) {
				$menu.find("#ml-delete").click((e: JQueryEventObject) => {
					e.preventDefault();
					self.viewer.getDCase().removeNode(self.node);
				});
			} else {
				$menu.find("#ml-delete").parent("li").addClass("disabled");
				$menu.find("#ml-cut").parent("li").addClass("disabled");
			}

			$menu.find("#ml-export-json").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.exportSubtree("json", self.node);
			});
			$menu.find("#ml-export-png").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.exportSubtree("png", self.node);
			});
			$menu.find("#ml-export-pdf").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.exportSubtree("pdf", self.node);
			});
			$menu.find("#ml-export-dscript").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.exportSubtree("dscript", self.node);
			});

			$menu.find("#ml-openall").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.expandBranch(self, true, true);
			});

			$menu.find("#ml-closeall").click((e: JQueryEventObject) => {
				e.preventDefault();
				self.viewer.expandBranch(self, false, true);
			});

		} else {
			$toolbox.remove();
			$toolbox = null;
		}
	};

	self.$div.hover(() => {
		showToolbox(true);
	}, () => {
		showToolbox(false);
	});
};

function DNodeView_ToolBox_uneditable(self): void {
	var $toolbox: JQuery = null;
	
	function showToolbox(visible): void {
		if(visible) {
			if($toolbox != null) return;
			$toolbox = $("<div></div>")
				.css("display", self.$divText.css("display"))
				.appendTo(self.$div);
			var $menu: JQuery = $("#edit-menulist").clone()
				.css({ position: "absolute",bottom: 4, left: 4, display: "block" })
				.appendTo($toolbox);

			$menu.find("#ml-copy").click(() => {
				self.viewer.clipboard = self.node.deepCopy();
				console.log("copied");
			});

			$menu.find("#ml-cut").remove();
			$menu.find("#ml-paste").remove();
			$menu.find("#ml-delete").remove();

			$menu.find("#ml-export-json").click(() => {
				self.viewer.exportSubtree("json", self.node);
			});
			$menu.find("#ml-export-png").click(() => {
				self.viewer.exportSubtree("png", self.node);
			});
			$menu.find("#ml-export-pdf").click(() => {
				self.viewer.exportSubtree("pdf", self.node);
			});
			$menu.find("#ml-export-dscript").click(() => {
				self.viewer.exportSubtree("dscript", self.node);
			});

			$menu.find("#ml-openall").click(() => {
				self.viewer.expandBranch(self, true, true);
			});

			$menu.find("#ml-closeall").click(() => {
				self.viewer.expandBranch(self, false, true);
			});

		} else {
			$toolbox.remove();
			$toolbox = null;
		}
	};

	self.$div.hover(() => {
		showToolbox(true);
	}, () => {
		showToolbox(false);
	});

};

