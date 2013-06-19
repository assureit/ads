///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='./dcaseviewer-addons.ts'/>
///<reference path='./animation.ts'/>
///<reference path='./gsnshape.ts'/>
///<reference path='./dnode.ts'/>

interface DCaseViewerAddon {}
interface DNodeViewAddon {}
interface DCaseTheme {
	selected: string;
	hovered: string;
	stroke;
	fill;
}
class Rect {
	constructor(
		public x: number,
		public y: number,
		public w: number,
		public h: number,
	) {}
}

var ANIME_MSEC = 250;
var SCALE_MIN = 0.1;
var SCALE_MAX = 6.0;
var MIN_DISP_SCALE = 0.25;
var DEF_WIDTH = 200;

//-----------------------------------------------------------------------------

class DCaseViewer {
	nodeViewMap = {};
	moving : bool   = false;
	shiftX : number = 0;
	shiftY : number = 0;
	dragX  : number = 0;
	dragY  : number = 0;
	scale  : number = 1.0;
	location_updated: bool = false;
	drag_flag: bool = true;
	selectedNode: DNodeView = null;
	rootview  :DNodeView= null;
	clipboard :DCaseNodeModel= null;
	
	viewer_addons   : DCaseViewerAddon[] = [];
	nodeview_addons : DNodeViewAddon[]   = [];

	$root;
	$svg;
	$dom;
	$dummyDivForPointer;

	canMoveByKeyboard: bool = true;

	//TODO
	addEventHandler() {}
	dragEnd(view) {}
	
	constructor(public root: any, public dcase: DCaseModel, public editable: bool) {
		this.$root = $(root);
		root.className = "viewer-root";

		var $svgroot = $(document.createElementNS(SVG_NS, "svg"))
			.attr({ width: "100%", height: "100%" })
			.appendTo(this.$root);
		this.$svg = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0, 0)")
			.appendTo($svgroot);
		this.$dummyDivForPointer = $("<div>")
			.css({ width: "100%", height: "100%" , position: "absolute", top: "0px", left: "0px", "-ms-touch-action": "none" })
			.appendTo(this.$root);
		this.$dom = $("<div></div>")
			.css("position", "absolute")
			.appendTo(this.$root);

		//------------------------------------
	
		$.each(this.viewer_addons, (i, addon) => {
			addon(this);
		});
		this.setDCase(dcase);
		this.addEventHandler();
	
		this.canMoveByKeyboard = true;
	
		$(document.body).on("keydown", (e) => {
			if(e.keyCode == 39 /* RIGHT */ || e.keyCode == 37 /* LEFT */){
				if(!this.canMoveByKeyboard) return;
				var isRight = (e.keyCode == 39);
				var selected = this.getSelectedNode();
				if(!selected) return;
				var children = selected.children;
				var isContext = selected.node.isContext;
				//var isSubject = selected.node.isSubject;
				
				var neighbor = [];
				var keynode = (isContext /*|| isSubject*/ ? selected.parentView : selected);
				
				function push(n){
					if(n.subject) neighbor.push(n.subject);
					neighbor.push(n);
					if(n.context) neighbor.push(n.context);
				}
	
				if(keynode.parentView){
					var sibilings = keynode.parentView.children;
					for(var i = 0; i < sibilings.length; i++){
						push(sibilings[i]);
					}
				}else{
					push(keynode);
				}
	
				if(neighbor.length > 0){
					var oldIndex = neighbor.indexOf(selected);
					var newIndex = oldIndex + (isRight ? 1 : -1);
					if(newIndex >= neighbor.length) newIndex = neighbor.length - 1;
					if(newIndex < 0) newIndex = 0;
					if(oldIndex != newIndex){
						this.centerizeNodeView(neighbor[newIndex]);
						return;
					}
				}
	
				if(children && children.length > 1){
					var newIndex = (isRight ? children.length - 1 : 0);
					this.centerizeNodeView(children[newIndex]);
					return;
				}
			};
			if(e.keyCode == 38 /* UP */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected && selected.parentView){
					this.centerizeNodeView(selected.parentView);
				}
			};
			if(e.keyCode == 40 /* DOWN */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected && selected.children && selected.children[0]){
					this.centerizeNodeView(selected.children[0]);
				}
			};
			if(e.keyCode == 13 /* ENTER */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected && selected.startInplaceEdit){
					e.preventDefault(); 
					selected.startInplaceEdit();
				}else{
					this.setSelectedNode(this.rootview);
				}
			};
			if(e.keyCode == 27 /* ESC */){
				if(!this.canMoveByKeyboard) return;
				this.setSelectedNode(null);
			}
			if(e.keyCode == 67 && e.ctrlKey /* Ctrl+C */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected){
					this.clipboard = selected.node.deepCopy();
					console.log("copied");
				}
			}
			if(e.keyCode == 88 && e.ctrlKey /* Ctrl+X */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected && selected !== this.rootview){
					this.clipboard = selected.node.deepCopy();
					this.setSelectedNode(selected.parentView || this.rootview);
					this.getDCase().removeNode(selected.node);
					console.log("cut");
				}
			}
			if(e.keyCode == 86 && e.ctrlKey /* Ctrl+V */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected){
					var node = this.clipboard;
					if(node && selected.node.isTypeApendable(node.type)) {
						this.getDCase().pasteNode(selected.node, node, null);
						console.log("pasted");
					}
				}
			}
			if(e.keyCode == 46 /* Delete */){
				if(!this.canMoveByKeyboard) return;
				var selected = this.getSelectedNode();
				if(selected && selected !== this.rootview){
					this.setSelectedNode(selected.parentView || this.rootview);
					this.getDCase().removeNode(selected.node);
				}
			}
	
		});
	}
	
	exportSubtree(view, type) {
		alert("");
	}
	
	default_colorTheme = {
		stroke: {
			"Goal"    : "none",
			"Context" : "none",
			"Subject" : "none",
			"Strategy": "none",
			"Evidence": "none",
			"Solution": "none",
			"Rebuttal": "none",
			"Monitor" : "none",
		},
		fill: {
			"Goal"    : "#E0E0E0",
			"Context" : "#C0C0C0",
			"Subject" : "#C0C0C0",
			"Strategy": "#B0B0B0",
			"Evidence": "#D0D0D0",
			"Solution": "#D0D0D0",
			"Rebuttal": "#EEAAAA",
			"Monitor" : "#D0D0D0",
		},
		selected: "#F08080",
		hovered : "#8080F0",
	}
	
	colorTheme = this.default_colorTheme;

	//-----------------------------------------------------------------------------

	getDCase(): DCaseModel {
		return this.dcase;
	};
	
	setDCase(dcase: DCaseModel) {
		if(this.dcase != null) {
			this.dcase.removeListener(this);
		}
		if(dcase != null) {
			dcase.addListener(this);
		}
		this.dcase = dcase;
		this.nodeViewMap = {};
		this.$svg.empty();
		this.$dom.empty();
	
		if(dcase == null) {
			return;
		}
	
		this.nodeview_addons = [];
		this.nodeview_addons.push(DNodeView_ExpandBranch);
		if(this.editable) {
			this.nodeview_addons.push(DNodeView_InplaceEdit);
			this.nodeview_addons.push(DNodeView_ToolBox);
		} else {
			this.nodeview_addons.push(DNodeView_ToolBox_uneditable);
		}
	
		var create = (node, parent) => {
			var view = new DNodeView(this, node, parent);
			this.nodeViewMap[node.id] = view;
			node.eachSubNode((i, child) => {
				create(child, view);
			});
			return view;
		}
		this.rootview = create(dcase.getTopGoal(), null);
	
		this.$dom.ready(() => {
			function f(v) {//FIXME
				var b = v.svg.outer(DEF_WIDTH, v.$divText.height() + 60);
				v.nodeSize.h = b.h;
				v.forEachNode((e) => {
					f(e);
				});
			}
			f(this.rootview);
			this.rootview.updateLocation();
			this.shiftX = (this.$root.width() - this.treeSize().x * this.scale)/2;
			this.shiftY = 60;
			this.location_updated = true;
			this.repaintAll();
		});
	};
	
	//-----------------------------------------------------------------------------
	
	setLocation(x: number, y: number, scale: number, ms: number) {
		this.shiftX = x;
		this.shiftY = y;
		if(scale != null) {
			this.scale = scale;
			this.$svg.attr("transform", "scale(" + scale + ")");
			this.$dom.css("transform", "scale(" + scale + ")");
			this.$dom.css("-moz-transform", "scale(" + scale + ")");
			this.$dom.css("-webkit-transform", "scale(" + scale + ")");
		}
		this.repaintAll(ms);
	};
	
	//-----------------------------------------------------------------------------
	
	getNodeView(node: DCaseNodeModel): DNodeView {
		return this.nodeViewMap[node.id];
	};
	
	setSelectedNode(view: DNodeView) {
		if(view != null) {
			if(this.selectedNode === view){
				return;
			}
			view.selected = true;
			view.updateColor();
		}
		if(this.selectedNode != null) {
			this.selectedNode.selected = false;
			this.selectedNode.updateColor();
		}
		this.selectedNode = view;
	};
	
	getSelectedNode(): DNodeView {
		return this.selectedNode;
	};
	
	treeSize(): Point {
		return this.rootview.subtreeSize;
	};
	
	setColorTheme(theme: DCaseTheme) {
		if(theme != null) {
			this.colorTheme = theme;
		} else {
			delete this.colorTheme;
		}
		this.location_updated = true;
		this.repaintAll();
	};
	
	//-----------------------------------------------------------------------------
	
	structureUpdated(ms: number) {
		this.setDCase(this.dcase);
	};
	
	nodeInserted(parent: DCaseNodeModel, node: DCaseNodeModel, index: number) {
		var parentView = this.getNodeView(parent);
	
		var create = (node, parent) => {
			var view = new DNodeView(this, node, parent);
			this.nodeViewMap[node.id] = view;
			node.eachSubNode((i, child) => {
				create(child, view);
			});
			return view;
		}
		var view = create(node, parentView);
	
		parentView.nodeChanged();
	
		this.$dom.ready(() => {
			function f(v) {//FIXME
				var b = v.svg.outer(200, v.$divText.height() + 60);
				v.nodeSize.h = b.h;
			}
			f(view);
			this.location_updated = true;
			this.repaintAll();
		});
	};
	
	nodeRemoved(parent: DCaseNodeModel, node: DCaseNodeModel, index: number) {
		var parentView = this.getNodeView(parent);
		var view = this.getNodeView(node);
		view.remove(parentView);
		delete this.nodeViewMap[node.id];
	
		parentView.nodeChanged();
	
		this.$dom.ready(() => {
			this.location_updated = true;
			this.repaintAll();
		});
	};
	
	nodeChanged(node: DCaseNodeModel) {
		var view = this.getNodeView(node);
	
		view.nodeChanged();
		this.$dom.ready(() => {
			function f(v) {//FIXME
				var b = v.svg.outer(200, v.$divText.height() + 60);
				v.nodeSize.h = b.h;
			}
			f(view);
			this.location_updated = true;
			this.repaintAll();
		});
	};
	
	//-----------------------------------------------------------------------------
	
	centerize(node: DCaseNodeModel, ms?: number) {
		if(this.rootview == null) return;
		var view = this.getNodeView(node);
		this.setSelectedNode(view);
		var b = view.getLocation();
		var x = -b.x * this.scale + (this.$root.width() - view.nodeSize.w * this.scale) / 2;
		var y = -b.y * this.scale + this.$root.height() / 5 * this.scale;
		this.setLocation(x, y, null, ms);
	};
	
	centerizeNodeView(view: DNodeView, ms?: number) {
		if(this.rootview == null) return;
		this.setSelectedNode(view);
		var b = view.getLocation();
		var x = -b.x * this.scale + (this.$root.width() - view.nodeSize.w * this.scale) / 2;
		var y = -b.y * this.scale + this.$root.height() / 5 * this.scale;
		this.setLocation(x, y, null, ms);
	};
	
	repaintAll(ms?: number) {
		if(this.rootview == null) return;
	
		var dx = Math.floor(this.shiftX + this.dragX);
		var dy = Math.floor(this.shiftY + this.dragY);
	
		var a = new Animation();
		a.moves(this.$svg[0].transform.baseVal.getItem(0).matrix, { e: dx, f: dy });
		a.moves(this.$dom, { left: dx, top: dy });
	
		if(ms == 0 || ms == null) {
			if(this.location_updated) {
				this.rootview.updateLocation();
				this.location_updated = false;
				this.rootview.animeStart(a, 0, 0);
			}
			a.animeFinish();
			return;
		}
		this.rootview.updateLocation();
		this.rootview.animeStart(a, 0, 0);
		this.moving = true;
		var begin = new Date();
		var id = setInterval(() => {
			var time = (<any>new Date()) - begin;
			var r = time / ms;
			if(r < 1.0) {
				a.anime(r);
			} else {
				clearInterval(id);
				a.animeFinish();
				this.moving = false;
			}
		}, 1000/60);
	};
	
	expandBranch(view: DNodeView, b: bool, isAll: bool) {
		if(b == null) b = !view.childVisible;
	
		var b0 = view.getLocation();
		if(isAll != null && isAll) {
			view.setChildVisibleAll(b);
		} else {
			view.setChildVisible(b);
		}
		this.rootview.updateLocation();
		var b1 = view.getLocation();
		this.shiftX -= (b1.x-b0.x) * this.scale;
		this.shiftY -= (b1.y-b0.y) * this.scale;
		this.location_updated = true;
		this.repaintAll(ANIME_MSEC);
	};
	
	//fit(ms) {
	//	if(this.rootview == null) return;
	//	var size = this.rootview.treeSize();
	//	this.scale = Math.min(
	//		this.root.width()  * 0.98 / size.x,
	//		this.root.height() * 0.98 / size.y);
	//	var b = this.rootview.bounds;
	//	this.shiftX = -b.x * this.scale + (this.$root.width() - b.w * this.scale) / 2;
	//	this.shiftY = -b.y * this.scale + (this.$root.height() - size.y * this.scale) / 2;
	//	this.repaintAll(ms);
	//};

}

//-----------------------------------------------------------------------------


function createContextLineElement(){
	return $(document.createElementNS(SVG_NS, "line")).attr({
		fill: "none",
		stroke: "gray",
		x1: 0, y1: 0, x2: 0, y2: 0,
		"marker-end": "url(#Triangle-white)",
	});
}

function createChildLineElement(){
	return $(document.createElementNS(SVG_NS, "path")).attr({
		fill: "none",
		stroke: "gray",
		d: "M0,0 C0,0 0,0 0,0",
		"marker-end": "url(#Triangle-black)",
	});
}

function createUndevelopMarkElement(){
	return $(document.createElementNS(SVG_NS, "polygon")).attr({
		fill: "none", stroke: "gray",
		points: "0,0 0,0 0,0 0,0"
	});
}

function createArgumentBorderElement(){
	return $(document.createElementNS(SVG_NS, "rect")).attr({
		stroke: "#8080D0",
		fill: "none",
		"stroke-dasharray": 3,
	});
}

class DNodeView {
	svg;
	$rootsvg;
	$div;
	svgUndevel = null;
	argumentBorder = null;

	$divName;
	$divText;
	$divNodes;

	children: DNodeView[] = [];
	context: DNodeView = null;
	subject: DNodeView = null;
	rebuttal:DNodeView = null;
	line = null;
	
	offset   = new Point(0, 0);
	nodeSize = new Point(DEF_WIDTH, 100);
	subtreeBounds = new Rect(0, 0, 0, 0);
	subtreeSize = new Point(0, 0);
	
	visible: bool = true;
	childVisible: bool = true;
	selected: bool = false;
	hovered: bool = false;

	nodeOffset = 0;

	bounds: Rect;
	//TODO
	startInplaceEdit: ()=>void;
	
	constructor(public viewer: DCaseViewer,
			public node: DCaseNodeModel, public parentView: DNodeView) {
		var $root, $rootsvg;
		$root = viewer.$dom;
		$rootsvg = viewer.$svg;
		this.$rootsvg = $rootsvg;
		
		this.$div = $("<div></div>")
				.addClass("node-container")
				.width(DEF_WIDTH)
				.css("left", $(document).width() / viewer.scale)//FIXME
				.appendTo($root);
	
		this.$divName = $("<div></div>")
			.addClass("node-name")
			.appendTo(this.$div);
		this.$divText = $("<div></div>")
			.addClass("node-text")
			.appendTo(this.$div);
		this.$divNodes = $("<div></div>")
			.addClass("node-closednodes")
			.appendTo(this.$div);
	

		if(parentView != null) {
			if(node.isContext) {
				this.line = createContextLineElement()[0];
				if(this.node.type == "Subject") parentView.subject = this;
				else if(this.node.type == "Rebuttal") parentView.rebuttal = this;
				else parentView.context = this;
			} else {
				this.line = createChildLineElement()[0];
				parentView.children.push(this);
			}
			this.$rootsvg.append(this.line);
		}
	
		this.$div.mouseup((e) => {
			this.viewer.dragEnd(this);
		});
	
		this.$div.hover(() => {
			this.hovered = true;
			this.updateColor();
		}, () => {
			this.hovered = false;
			this.updateColor();
		});
	
		this.nodeChanged();
	
		$.each(viewer.nodeview_addons, (i, addon) => {
			addon(this);
		});
	}

	nodeChanged() {
		var node = this.node;
		var viewer = this.viewer;
	
		// undeveloped
		node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
		if(node.isUndeveloped && this.svgUndevel == null) {
			this.svgUndevel = createUndevelopMarkElement().appendTo(this.$rootsvg);
		} else if(!node.isUndeveloped && this.svgUndevel != null){
			this.svgUndevel.remove();
			this.svgUndevel = null;
		}
	
		// argument
		if(node.isArgument && this.argumentBorder == null) {
			this.argumentBorder = createArgumentBorderElement().appendTo(this.$rootsvg);
		} else if(!node.isArgument && this.argumentBorder != null) {
			this.argumentBorder.remove();
			this.argumentBorder = null;
		}
	
		// node name and description
		this.$divName.html(node.name);
		this.$divText.html(node.getHtmlDescription());
		this.$divText.append(node.getHtmlMetadata());
		if(this.svg){
			$(this.svg[0]).remove();
		}
		this.svg = new GsnShapeMap[node.type](this.$rootsvg);
		//this.$div.appendTo(this.svg[1]);
		var count = node.getNodeCount();
		if(count != 0) {
			this.$divNodes.html(count + " nodes...");
		} else {
			this.$divNodes.html("");
		}
	}
		
	updateColor() {
		var stroke;
		if(this.selected) {
			stroke = this.viewer.colorTheme.selected;
		} else if(this.hovered) {
			stroke = this.viewer.colorTheme.hovered;
		} else {
			stroke = this.viewer.colorTheme.stroke[this.node.type];
		}
		var fill = this.viewer.colorTheme.fill[this.node.type];
		this.svg[0].setAttribute("stroke", stroke);
		this.svg[0].setAttribute("fill", fill);
	}
	
	remove(parentView: DNodeView) {
		if(this.context != null) {
			this.context.remove(this);
		}
		if(this.subject != null) {
			this.subject.remove(this);
		}
		if(this.rebuttal != null) {
			this.rebuttal.remove(this);
		}
		while(this.children.length != 0) {
			this.children[0].remove(this);
		}
		$(this.svg[0]).remove();
		this.$div.remove();
		if(this.svgUndevel != null) $(this.svgUndevel).remove();
		if(this.argumentBorder != null) $(this.argumentBorder).remove();
		if(this.line != null) $(this.line).remove();
	
		if(this.node.isContext) {
			if(this.node.type == "Subject") parentView.subject = null;
			else if(this.node.type == "Rebuttal") parentView.rebuttal = null;
			else parentView.context = null;
		} else {
			parentView.children.splice(parentView.children.indexOf(this), 1);
		}
	}
	
	forEachNode(f: (view: DNodeView)=>void) {
		if(this.context != null) f(this.context);
		if(this.subject != null) f(this.subject);
		if(this.rebuttal != null) f(this.rebuttal);
		$.each(this.children, function(i, view) {
			f(view);
		});
	}
	
	setChildVisible(b: bool) {
		if(this.node.getNodeCount() == 0) b = true;
		this.childVisible = b;
	}
	
	setChildVisibleAll(b: bool) {
		this.setChildVisible(b);
		this.forEachNode(function(view) {
			view.setChildVisibleAll(b);
		});
	}
	
	updateLocation(visible?: bool) {
		var ARG_MARGIN = 4;
		var X_MARGIN = 30;
		var Y_MARGIN = 100;
	
		if(visible == null) visible = true;
		this.visible = visible;
		var childVisible = visible && this.childVisible;
	
		this.forEachNode(function(view) {
			view.updateLocation(childVisible);
		});
	
		if(!visible) {
			this.subtreeBounds = new Rect(0, 0, 0, 0);
			this.subtreeSize = new Point(0, 0);
			this.nodeOffset = 0;
			this.forEachNode(function(view) {
				view.offset = new Point(0, 0);
			});
			return;
		}
		var size = this.nodeSize;
		var x0 = 0, y0 = 0, x1 = size.w, y1 = size.h;
		var offY = 0;
	
		if(!childVisible) {
			this.forEachNode(function(view) {
				view.offset = new Point(0, 0);
			});
		} else {
			// context offset
			if(this.subject != null) {
				x0 = Math.min(x0, -(this.subject.subtreeSize.w + Y_MARGIN));
				y1 = Math.max(y1, this.subject.subtreeSize.h);
			}
			if(this.context != null) {
				x1 = Math.max(this.nodeSize.w + Y_MARGIN + this.context.subtreeSize.w);
				y1 = Math.max(y1, this.context.subtreeSize.h);
			}
			var ch = 0, rh = 0;
			if(this.rebuttal != null) {
				if(this.context != null) {
					ch = this.context.subtreeSize.h + X_MARGIN;
					rh = this.rebuttal.subtreeSize.h + X_MARGIN;
				}
				x1 = Math.max(this.nodeSize.w + Y_MARGIN + this.rebuttal.subtreeSize.w);
				y1 = Math.max(y1, ch + this.rebuttal.subtreeSize.h);
			}
			if(this.subject != null) {
				this.subject.offset = new Point(
					-(this.subject.subtreeSize.w + Y_MARGIN),
					(y1 - this.subject.subtreeSize.h) / 2
				);
			}
			if(this.context != null) {
				this.context.offset = new Point(
					(this.context.subtreeSize.w + Y_MARGIN),
					(y1 - this.context.subtreeSize.h - rh) / 2
				);
			}
			if(this.rebuttal != null) {
				this.rebuttal.offset = new Point(
					(this.rebuttal.subtreeSize.w + Y_MARGIN),
					(y1 - this.rebuttal.subtreeSize.h + ch) / 2
				);
			}
			// children offset
			var w2 = 0;
			$.each(this.children, function(i, view) {
				if(i != 0) w2 += X_MARGIN;
				w2 += view.subtreeSize.w;
			});
	
			offY = (y1 - size.h) / 2;
			var x;
			if(this.children.length == 1) {
				x = this.children[0].subtreeBounds.x;
			} else {
				x = -(w2 - size.w) / 2;
			}
			var y = Math.max(offY + size.h + Y_MARGIN, y1 + X_MARGIN);
			x0 = Math.min(x, x0);
			$.each(this.children, function(i, view) {
				if(i != 0) x += X_MARGIN;
				view.offset = { x: x, y: y };
				x += view.subtreeSize.w;
				x1 = Math.max(x1, x);
				y1 = Math.max(y1, y + view.subtreeSize.h);
			});
		}
		if(this.node.isArgument) {
			x0 -= ARG_MARGIN;
			y0 -= ARG_MARGIN;
			x1 += ARG_MARGIN;
			y1 += ARG_MARGIN;
		}
		if(this.node.isUndeveloped) {
			y1 += 40;
		}
		this.subtreeBounds = new Rect(x0, y0, x1, y1);
		this.subtreeSize = new Point(x1-x0, y1-y0);
		this.nodeOffset = offY;
	}
	
	getLocation(): Point {
		var l = new Point(this.offset.x - this.subtreeBounds.x, this.offset.y + this.nodeOffset);
		if(this.parentView != null) {
			var p = this.parentView.getLocation();
			l.x += p.x;
			l.y += p.y;
		}
		return l;
	}
	
	animeStart(a: Animation, x: number, y: number) {
		var parent = this.parentView;
	 	x -= this.subtreeBounds.x
		var b = new Rect(x, y + this.nodeOffset, this.nodeSize.w, this.nodeSize.h);
		this.bounds = b;
	
		a.show(this.svg[0], this.visible);
		a.show(this.$div, this.visible);
		a.show(this.$divNodes, !this.childVisible);
		this.updateColor();
	
		var offset = this.svg.animate(a, b.x, b.y, b.w, b.h);
		a.moves(this.$div, {
			left  : (b.x + offset.x),
			top   : (b.y + offset.y),
			width : (b.w - offset.x*2),
			height: (b.h - offset.y*2),
		});
	
		if(this.line != null) {
			var l = this.line;
			var pb = parent.bounds;//FIXME
			if(!this.node.isContext) {
				var start = l.pathSegList.getItem(0); // SVG_PATHSEG_MOVETO_ABS(M)
				var curve = l.pathSegList.getItem(1); // SVG_PATHSEG_CURVETO_CUBIC_ABS(C)
				var x1 = pb.x + pb.w/2;
				var y1 = pb.y + pb.h;
				var x2 = b.x + b.w/2;
				var y2 = b.y;
				a.show(l, this.visible);
				a.moves(start, {
					x: x1,
					y: y1,
				});
				a.moves(curve, {
					x1: (9 * x1 + x2) / 10,
					y1: (y1 + y2) / 2,
					x2: (9 * x2 + x1) / 10,
					y2: (y1 + y2) / 2,
					x: x2,
					y: y2,
				});
			} else {
				var n = parent.node.type == "Strategy" ? 10 : 0;
				if(this.node.type != "Subject") {
					a.moves(l, {
						x1: pb.x + pb.w - n,
						y1: pb.y + pb.h/2,
						x2: b.x,
						y2: b.y + b.h/2,
					});
				} else {
					a.moves(l, {
						x1: pb.x,
						y1: pb.y + pb.h/2,
						x2: b.x + b.w - n,
						y2: b.y + b.h/2,
					});
				}
				a.show(l, this.visible);
			}
		}
		if(this.svgUndevel != null) {
			var sx = b.x + b.w/2;
			var sy = b.y + b.h;
			var n = 20;
			a.show(this.svgUndevel[0], this.visible);
			a.movePolygon(this.svgUndevel[0], [
				{ x: sx, y: sy },
				{ x: sx-n, y: sy+n },
				{ x: sx, y: sy+n*2 },
				{ x: sx+n, y: sy+n },
			]);
		}
		if(this.argumentBorder != null) {
			var n = 10;
			var b = this.subtreeBounds;
			a.moves(this.argumentBorder[0], {
				x     : b.x + x,
				y     : b.y + y,
				width : b.w - b.x,
				height: b.h - b.y,
			});
			a.show(this.argumentBorder[0], this.visible);
		}
		this.forEachNode((e) => {
			e.animeStart(a, x + e.offset.x, y + e.offset.y);
		});
	}
}
