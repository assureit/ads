function levenshtein (s1, s2) {
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

	var s1_len = s1.length;
	var s2_len = s2.length;
	if (s1_len === 0) {
		return s2_len;
	}
	if (s2_len === 0) {
		return s1_len;
	}

	// BEGIN STATIC
	var split = false;
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

	var v0 = new Array(s1_len+1);
	var v1 = new Array(s1_len+1);

	var s1_idx=0, s2_idx=0, cost=0;
	for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) {
		v0[s1_idx] = s1_idx;
	}
	var char_s1='', char_s2='';
	for (s2_idx=1; s2_idx<=s2_len; s2_idx++) {
		v1[0] = s2_idx;
		char_s2 = s2[s2_idx - 1];

		for (s1_idx=0; s1_idx<s1_len;s1_idx++) {
			char_s1 = s1[s1_idx];
			cost = (char_s1 == char_s2) ? 0 : 1;
			var m_min = v0[s1_idx+1] + 1;
			var b = v1[s1_idx] + 1;
			var c = v0[s1_idx] + cost;
			if (b < m_min) {
				m_min = b; }
			if (c < m_min) {
				m_min = c; }
			v1[s1_idx+1] = m_min;
		}
		var v_tmp = v0;
		v0 = v1;
		v1 = v_tmp;
	}
	return v0[s1_len];
}

function findMostSimilarNodeType(query){
	var NodeTypes = ["Goal", "Context", "Subject", "Strategy", "Evidence", "Rebuttal", "Solution", "Monitor"];

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

	var min = levenshtein(NodeTypes[0], query);
	minidx = 0;
	for(var i = 1; i < NodeTypes.length; i++){
		var d = levenshtein(NodeTypes[i], query);
		if(min >= d){
			minidx = i;
		}
	}
	return NodeTypes[minidx];
};

var DNodeView_ExpandBranch = function(self) {
	var DBLTOUCH_THRESHOLD = 300;
	var count = 0;
	var time = null;

	self.$div.dblclick(function(e) {
		self.viewer.expandBranch(self);
	});

	self.$div.bind("touchstart", function(e) {
		var touches = e.originalEvent.touches;
		count = touches.length;
	});
	
	self.$div.bind("touchend", function(e) {
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

var DNodeView_InplaceEdit = function(self) {
	var $edit = null;

	self.$divText.addClass("node-text-editable");

	function generateMarkdownText(node) {
		var convert = (function(n){
			return ("# " + n.type + " " + n.name + " " + n.id + (n.desc.length > 0 ? ("\n" + n.desc) : "") + "\n\n");
		});

		var markdown = convert(node);  
		node.eachNode(function(n){
			markdown = markdown + convert(n);
		});
		return markdown;
	};

	function parseMarkdownText(src) {
		var nodesrc = src.split(/^#+/m).slice(1);
		var nodes = [];
		for(var i = 0; i < nodesrc.length; ++i){
			var lines = nodesrc[i].split(/\r\n|\r|\n/);
			var heads = lines[0].trim().split(/\s+/);
			var node = {
				type: findMostSimilarNodeType(heads[0]),
				name: heads[1],
				id  : heads[2],
				description: lines.slice(1).join("\n").trim(),
				children: [],
			};
			nodes.push(node);
		};
		return nodes;
	};

	function showInplace() {
		if($edit == null) {
			var cc = 0;
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
				.mousedown(function(e) { e.stopPropagation(); })
				.mousewheel(function(e) { e.stopPropagation(); })
				.dblclick(function(e) {
					if(cc >= 2) e.stopPropagation();
					cc = 0;
				})
				.click(function(e) { cc++; e.stopPropagation(); })
				.blur(closingInplace)
				.trigger("autosize")
				.on("keydown", function(e){
					if(e.keyCode == 27 /* ESC */){ e.stopPropagation(); closingInplace(); };
				});
		}
	}

	function updateNode(node, nodejson) {
		var newDesc = nodejson.description;
		var newType = nodejson.type;
		var newName = nodejson.name || newType[0] + "_" + node.id;
		var DCase = self.viewer.getDCase();
		DCase.setParam(node, newType, newName, newDesc);
		return node;
	}

	function closingInplace() {
		var markdown = $edit.attr("value").trim();
		var nodes = parseMarkdownText(markdown);
		var node = self.node;
		var viewer = self.viewer;
		var DCase = viewer.getDCase();
		var parent = node.parents[0];
		
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
					node.eachNode(function(n){
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
			
			var idNodeTable = {};
			var idIndexTable = {};

			var ch = 0; co = 0;
			node.eachNode(function(n){
				idNodeTable[n.id] = n;
				if(n.isContext){
					idIndexTable[n.id] = co++;
				}else{
					idIndexTable[n.id] = ch++;
				}
			});

			var newChildren = [];
			var newContexts = [];

			var treeChanged = false;
			for(var i = 1; i < nodes.length; ++i){
				var nd = nodes[i];
				var id = nd.id;
				if(idNodeTable[id]){
					if(!node.isTypeApendable(nd.type)){
						nd.type = idNodeTable[id].type;
					}
					var newNode = updateNode(idNodeTable[id], nd);
					// check subnode swapping
					treeChanged = idIndexTable[id] !== (newNode.isContext ? newContexts : newChildren).length;
					delete idNodeTable[id];
					(newNode.isContext ? newContexts : newChildren).push(newNode);
				}else if(node.isTypeApendable(nd.type)){
					// create new node
					var newNode = DCase.insertNode(node, nd.type, nd.description);
					treeChanged = true;
					(newNode.isContext ? newContexts : newChildren).push(newNode);
				}
			}
			// if a node is left in Table, it means that the node is removed from markdown text.
			jQuery.each(idNodeTable, function(i,v){
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

	function closeInplace() {
		if($edit != null) {
			$edit.remove();
			$edit = null;
			self.$divText.css("display", "block");
			self.viewer.$root.css("-moz-user-select", "none");
		}
	}

	self.$divText.click(function() {
		showInplace();
	});
	
	self.$div.dblclick(function(e) {
		closeInplace();
	})
	
	self.startInplaceEdit = function() {
		showInplace();
	};

};

//-----------------------------------------------------------------------------

var DNodeView_ToolBox = function(self) {
	var edit_lock = false;
	var edit_hover = false;
	var edit_active = false;
	var $edit = null;
	var timeout = null;

	function showNewNode(visible) {
		var type_selected = null;
		function edit_close() {
			$edit.remove();
			$edit = null;
			self.viewer.canMoveByKeyboard = true;
			self.viewer.$root.css("-moz-user-select", "text");
		}
		function edit_activate() {
			if(!edit_active) {
				self.viewer.canMoveByKeyboard = false;
				edit_active = true;
				edit_lock = true;
				$edit.css("opacity", 0.95);
				self.viewer.$root.css("-moz-user-select", "text");
				self.viewer.$root.one("click", function() {
					var text = $edit.find("textarea").attr("value");
					if(text != "") {
						self.viewer.getDCase().insertNode(self.node, type_selected, text);
					}
					edit_close();
				});
			}
		}
		function clear_timeout() {
			if(timeout != null) {
				clearTimeout(timeout);
				timeout = null;
			}
		}
		if(visible) {
			var types = self.node.appendableTypes();
			if(self.node.contexts.length > 0) {
				types = types.slice(0);//clone
				for(var i=0; i<self.node.contexts.length; i++) {
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
				.hover(function() {
					edit_hover = true;
					clear_timeout();
				}, function() {
					edit_hover = false;
					showNewNode(false);
				})
				.one("click", function() { edit_activate(); })
				.click(function(e) { e.stopPropagation(); })
				.appendTo(self.$div);

				var $ul = $edit.find("ul");
				$.each(types, function(i, type) {
					var $li = $("<li></li>")
						.html("<a href=\"#\">" + type + "</a>")
						.click(function() {
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
					.mousedown(function(e) { e.stopPropagation(); })
					.mousewheel(function(e) { e.stopPropagation(); })
					.dblclick(function(e) { e.stopPropagation(); })
					.one("keydown", function() { edit_activate(); });

				$edit.ready(function() {
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
					timeout = setTimeout(function() {
						edit_close();
					}, 100);
				}
			}
		}
	};

	var $toolbox = null;
	
	function showToolbox(visible) {
		if(visible) {
			if($toolbox != null) return;
			$toolbox = $("<div></div>")
				.css("display", self.$divText.css("display"))
				.appendTo(self.$div);
	
			$("<a href=\"#\"></a>").addClass("icon-plus")
				.css({ position: "absolute",bottom: 4, left: 4, })
				.hover(function() {
					showNewNode(true);
				}, function() {
					showNewNode(false);
				})
				.appendTo($toolbox);
	
			var $menu = $("#edit-menulist").clone()
				.css({ position: "absolute",bottom: 4, left: 24, display: "block" })
				.appendTo($toolbox);

			$menu.find("#ml-cut").click(function() {
				self.viewer.clipboard = self.node.deepCopy();
				self.viewer.getDCase().removeNode(self.node);
				console.log("cut");
			});

			$menu.find("#ml-copy").click(function() {
				self.viewer.clipboard = self.node.deepCopy();
				console.log("copied");
			});

			$menu.find("#ml-paste").click(function() {
				var node = self.viewer.clipboard;
				if(node != null) {
					if(self.node.isTypeApendable(node.type)) {
						self.viewer.getDCase().pasteNode(self.node, node);
						console.log("pasted");
					} else {
						alert("そのタイプは貼付けられません");
					}
				}
			});

			if(self.node.parents.length != 0) {
				$menu.find("#ml-delete").click(function() {
					self.viewer.getDCase().removeNode(self.node);
				});
			} else {
				$menu.find("#ml-delete").parent("li").addClass("disabled");
				$menu.find("#ml-cut").parent("li").addClass("disabled");
			}

			$menu.find("#ml-export-json").click(function() {
				self.viewer.exportSubtree("json", self.node);
			});
			$menu.find("#ml-export-png").click(function() {
				self.viewer.exportSubtree("png", self.node);
			});
			$menu.find("#ml-export-pdf").click(function() {
				self.viewer.exportSubtree("pdf", self.node);
			});
			$menu.find("#ml-export-dscript").click(function() {
				self.viewer.exportSubtree("dscript", self.node);
			});

			$menu.find("#ml-openall").click(function() {
				self.viewer.expandBranch(self, true, true);
			});

			$menu.find("#ml-closeall").click(function() {
				self.viewer.expandBranch(self, false, true);
			});

		} else {
			$toolbox.remove();
			$toolbox = null;
		}
	};

	self.$div.hover(function() {
		showToolbox(true);
	}, function() {
		showToolbox(false);
	});
};

var DNodeView_ToolBox_uneditable = function(self) {
	var $toolbox = null;
	
	function showToolbox(visible) {
		if(visible) {
			if($toolbox != null) return;
			$toolbox = $("<div></div>")
				.css("display", self.$divText.css("display"))
				.appendTo(self.$div);
			var $menu = $("#edit-menulist").clone()
				.css({ position: "absolute",bottom: 4, left: 4, display: "block" })
				.appendTo($toolbox);

			$menu.find("#ml-copy").click(function() {
				self.viewer.clipboard = self.node.deepCopy();
				console.log("copied");
			});

			$menu.find("#ml-cut").remove();
			$menu.find("#ml-paste").remove();
			$menu.find("#ml-delete").remove();

			$menu.find("#ml-export-json").click(function() {
				self.viewer.exportSubtree("json", self.node);
			});
			$menu.find("#ml-export-png").click(function() {
				self.viewer.exportSubtree("png", self.node);
			});
			$menu.find("#ml-export-pdf").click(function() {
				self.viewer.exportSubtree("pdf", self.node);
			});
			$menu.find("#ml-export-dscript").click(function() {
				self.viewer.exportSubtree("dscript", self.node);
			});

			$menu.find("#ml-openall").click(function() {
				self.viewer.expandBranch(self, true, true);
			});

			$menu.find("#ml-closeall").click(function() {
				self.viewer.expandBranch(self, false, true);
			});

		} else {
			$toolbox.remove();
			$toolbox = null;
		}
	};

	self.$div.hover(function() {
		showToolbox(true);
	}, function() {
		showToolbox(false);
	});

};

