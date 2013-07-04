var ANIME_MSEC = 250;
var SCALE_MIN = 0.1;
var SCALE_MAX = 6.0;
var MIN_DISP_SCALE = 0.25;
var DEF_WIDTH = 200;
var DCaseViewer = (function () {
    function DCaseViewer(root, dcase, editable) {
        this.dcase = dcase;
        this.editable = editable;
        var _this = this;
        this.nodeViewMap = {
        };
        this.moving = false;
        this.shiftX = 0;
        this.shiftY = 0;
        this.dragX = 0;
        this.dragY = 0;
        this.scale = 1.0;
        this.location_updated = false;
        this.drag_flag = true;
        this.selectedNode = null;
        this.rootview = null;
        this.clipboard = null;
        this.handler = null;
        this.viewer_addons = [];
        this.nodeview_addons = [];
        this.$svg = $(document.createElementNS(SVG_NS, "g")).attr("transform", "translate(0, 0)");
        this.$dom = $("<div></div>").css("position", "absolute");
        this.$dummyDivForPointer = $("<div></div>").css({
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0px",
            left: "0px",
            "-ms-touch-action": "none"
        });
        this.canMoveByKeyboard = true;
        this.exportSubtree = function (view, type) {
            alert("");
        };
        this.$root = $(root);
        root.className = "viewer-root";
        var $svgroot = $(document.createElementNS(SVG_NS, "svg")).attr({
            width: "100%",
            height: "100%"
        }).appendTo(this.$root);
        this.$svg.appendTo($svgroot);
        this.$root.append(this.$dummyDivForPointer).append(this.$dom);
        this.colorSets = new ColorSets(this);
        this.colorSets.createDropMenu();
        var name = document.cookie.match(/colorTheme=(\w+);?/);
        if(name != null) {
            this.setColorTheme(this.colorSets.get(name[1]));
        }
        $.each(this.viewer_addons, function (i, addon) {
            addon(_this);
        });
        this.addEventHandler();
        this.initKeyHandler();
        this.setDCase(dcase);
        this.canMoveByKeyboard = true;
    }
    DCaseViewer.prototype.addEventHandler = function () {
        var _this = this;
        this.handler = new PointerHandler(this);
        this.dragEnd = function (view) {
            return _this.handler.dragEnd(view);
        };
    };
    DCaseViewer.prototype.initKeyHandler = function () {
        var _this = this;
        $(document.body).on("keydown", function (e) {
            if(e.keyCode == 39 || e.keyCode == 37) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var isRight = (e.keyCode == 39);
                var selected = _this.getSelectedNode();
                if(!selected) {
                    return;
                }
                var children = selected.children;
                var isContext = selected.node.isContext;
                var neighbor = [];
                var keynode = (isContext ? selected.parentView : selected);
                function push(n) {
                    if(n.subject) {
                        neighbor.push(n.subject);
                    }
                    neighbor.push(n);
                    if(n.context) {
                        neighbor.push(n.context);
                    }
                }
                if(keynode.parentView) {
                    var sibilings = keynode.parentView.children;
                    for(var i = 0; i < sibilings.length; i++) {
                        push(sibilings[i]);
                    }
                } else {
                    push(keynode);
                }
                if(neighbor.length > 0) {
                    var oldIndex = neighbor.indexOf(selected);
                    var newIndex = oldIndex + (isRight ? 1 : -1);
                    if(newIndex >= neighbor.length) {
                        newIndex = neighbor.length - 1;
                    }
                    if(newIndex < 0) {
                        newIndex = 0;
                    }
                    if(oldIndex != newIndex) {
                        _this.centerizeNodeView(neighbor[newIndex]);
                        return;
                    }
                }
                if(children && children.length > 1) {
                    var newIndex = (isRight ? children.length - 1 : 0);
                    _this.centerizeNodeView(children[newIndex]);
                    return;
                }
            }
            ;
            if(e.keyCode == 38) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected && selected.parentView) {
                    _this.centerizeNodeView(selected.parentView);
                }
            }
            ;
            if(e.keyCode == 40) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected && selected.children && selected.children[0]) {
                    _this.centerizeNodeView(selected.children[0]);
                }
            }
            ;
            if(e.keyCode == 13) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected && selected.startInplaceEdit) {
                    e.preventDefault();
                    selected.startInplaceEdit();
                } else {
                    _this.setSelectedNode(_this.rootview);
                }
            }
            ;
            if(e.keyCode == 27) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                _this.setSelectedNode(null);
            }
            if(e.keyCode == 67 && e.ctrlKey) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected) {
                    _this.clipboard = selected.node.deepCopy();
                    console.log("copied");
                }
            }
            if(e.keyCode == 88 && e.ctrlKey) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected && selected !== _this.rootview) {
                    _this.clipboard = selected.node.deepCopy();
                    _this.setSelectedNode(selected.parentView || _this.rootview);
                    _this.getDCase().removeNode(selected.node);
                    console.log("cut");
                }
            }
            if(e.keyCode == 86 && e.ctrlKey) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected) {
                    var node = _this.clipboard;
                    if(node && selected.node.isTypeApendable(node.type)) {
                        _this.getDCase().pasteNode(selected.node, node, null);
                        console.log("pasted");
                    }
                }
            }
            if(e.keyCode == 46) {
                if(!_this.canMoveByKeyboard) {
                    return;
                }
                var selected = _this.getSelectedNode();
                if(selected && selected !== _this.rootview) {
                    _this.setSelectedNode(selected.parentView || _this.rootview);
                    _this.getDCase().removeNode(selected.node);
                }
            }
        });
    };
    DCaseViewer.prototype.getDCase = function () {
        return this.dcase;
    };
    DCaseViewer.prototype.setDCaseName = function (name) {
        this.dcaseName = name;
    };
    DCaseViewer.prototype.getDCaseName = function () {
        return this.dcaseName;
    };
    DCaseViewer.prototype.setDCase = function (dcase) {
        var _this = this;
        if(this.dcase != null) {
            this.dcase.removeListener(this);
        }
        if(dcase != null) {
            dcase.addListener(this);
        }
        this.dcase = dcase;
        this.nodeViewMap = {
        };
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
        var create = function (node, parent) {
            var view = new DNodeView(_this, node, parent);
            _this.nodeViewMap[node.id] = view;
            node.eachSubNode(function (i, child) {
                create(child, view);
            });
            return view;
        };
        this.rootview = create(dcase.getTopGoal(), null);
        this.$dom.ready(function () {
            function f(v) {
                var b = v.svgShape.outer(DEF_WIDTH, v.$divText.height() + 60);
                v.nodeSize.h = b.h;
                v.forEachNode(function (e) {
                    f(e);
                });
            }
            f(_this.rootview);
            _this.rootview.updateLocation();
            _this.shiftX = (_this.$root.width() - _this.treeSize().w * _this.scale) / 2;
            _this.shiftY = 60;
            _this.location_updated = true;
            _this.repaintAll();
        });
        var importFile = new ImportFile(".node-container");
        importFile.upload(function (data, target) {
            var selected = _this.getSelectedNode();
            selected.node.desc += "\n" + data;
            _this.setDCase(_this.dcase);
            _this.location_updated = true;
        });
    };
    DCaseViewer.prototype.setLocation = function (x, y, scale, ms) {
        if (typeof ms === "undefined") { ms = 0; }
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
    DCaseViewer.prototype.getNodeView = function (node) {
        return this.nodeViewMap[node.id];
    };
    DCaseViewer.prototype.setSelectedNode = function (view) {
        if(view != null) {
            if(this.selectedNode === view) {
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
    DCaseViewer.prototype.getSelectedNode = function () {
        return this.selectedNode;
    };
    DCaseViewer.prototype.treeSize = function () {
        return this.rootview.subtreeSize;
    };
    DCaseViewer.prototype.setColorTheme = function (theme) {
        if(theme != null) {
            this.colorSets.colorTheme = theme;
        } else {
            delete this.colorSets.colorTheme;
        }
        this.location_updated = true;
        this.repaintAll();
    };
    DCaseViewer.prototype.structureUpdated = function () {
        this.setDCase(this.dcase);
    };
    DCaseViewer.prototype.nodeInserted = function (parent, node, index) {
        var _this = this;
        var parentView = this.getNodeView(parent);
        var create = function (node, parent) {
            var view = new DNodeView(_this, node, parent);
            _this.nodeViewMap[node.id] = view;
            node.eachSubNode(function (i, child) {
                create(child, view);
            });
            return view;
        };
        var view = create(node, parentView);
        parentView.nodeChanged();
        this.$dom.ready(function () {
            function f(v) {
                var b = v.svgShape.outer(200, v.$divText.height() + 60);
                v.nodeSize.h = b.h;
            }
            f(view);
            _this.location_updated = true;
            _this.repaintAll();
        });
    };
    DCaseViewer.prototype.nodeRemoved = function (parent, node, index) {
        var _this = this;
        var parentView = this.getNodeView(parent);
        var view = this.getNodeView(node);
        view.remove(parentView);
        delete this.nodeViewMap[node.id];
        parentView.nodeChanged();
        this.$dom.ready(function () {
            _this.location_updated = true;
            _this.repaintAll();
        });
    };
    DCaseViewer.prototype.nodeChanged = function (node) {
        var _this = this;
        var view = this.getNodeView(node);
        view.nodeChanged();
        this.$dom.ready(function () {
            function f(v) {
                var b = v.svgShape.outer(200, v.$divText.height() + 60);
                v.nodeSize.h = b.h;
            }
            f(view);
            _this.location_updated = true;
            _this.repaintAll();
        });
    };
    DCaseViewer.prototype.centerize = function (node, ms) {
        if (typeof ms === "undefined") { ms = 0; }
        if(this.rootview == null) {
            return;
        }
        var view = this.getNodeView(node);
        this.setSelectedNode(view);
        var b = view.getLocation();
        var x = -b.x * this.scale + (this.$root.width() - view.nodeSize.w * this.scale) / 2;
        var y = -b.y * this.scale + this.$root.height() / 5 * this.scale;
        this.setLocation(x, y, null, ms);
    };
    DCaseViewer.prototype.centerizeNodeView = function (view, ms) {
        if (typeof ms === "undefined") { ms = 0; }
        if(this.rootview == null) {
            return;
        }
        this.setSelectedNode(view);
        var b = view.getLocation();
        var x = -b.x * this.scale + (this.$root.width() - view.nodeSize.w * this.scale) / 2;
        var y = -b.y * this.scale + this.$root.height() / 5 * this.scale;
        this.setLocation(x, y, null, ms);
    };
    DCaseViewer.prototype.repaintAll = function (ms) {
        if (typeof ms === "undefined") { ms = 0; }
        var _this = this;
        if(this.rootview == null) {
            return;
        }
        var dx = Math.floor(this.shiftX + this.dragX);
        var dy = Math.floor(this.shiftY + this.dragY);
        var a = new Animation();
        a.moves((this.$svg[0]).transform.baseVal.getItem(0).matrix, {
            e: dx,
            f: dy
        });
        a.moves(this.$dom, {
            left: dx,
            top: dy
        });
        if(ms == 0) {
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
        var id = setInterval(function () {
            var time = (new Date()) - begin;
            var r = time / ms;
            if(r < 1.0) {
                a.anime(r);
            } else {
                clearInterval(id);
                a.animeFinish();
                _this.moving = false;
            }
        }, 1000 / 60);
    };
    DCaseViewer.prototype.expandBranch = function (view, b, isAll) {
        if(b == null) {
            b = !view.childVisible;
        }
        var b0 = view.getLocation();
        if(isAll != null && isAll) {
            view.setChildVisibleAll(b);
        } else {
            view.setChildVisible(b);
        }
        this.rootview.updateLocation();
        var b1 = view.getLocation();
        this.shiftX -= (b1.x - b0.x) * this.scale;
        this.shiftY -= (b1.y - b0.y) * this.scale;
        this.location_updated = true;
        this.repaintAll(ANIME_MSEC);
    };
    return DCaseViewer;
})();
function createContextLineElement() {
    return $(document.createElementNS(SVG_NS, "line")).attr({
        fill: "none",
        stroke: "gray",
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        "marker-end": "url(#Triangle-white)"
    });
}
function createChildLineElement() {
    return $(document.createElementNS(SVG_NS, "path")).attr({
        fill: "none",
        stroke: "gray",
        d: "M0,0 C0,0 0,0 0,0",
        "marker-end": "url(#Triangle-black)"
    });
}
function createUndevelopMarkElement() {
    return $(document.createElementNS(SVG_NS, "polygon")).attr({
        fill: "none",
        stroke: "gray",
        points: "0,0 0,0 0,0 0,0"
    });
}
function createArgumentBorderElement() {
    return $(document.createElementNS(SVG_NS, "rect")).attr({
        stroke: "#8080D0",
        fill: "none",
        "stroke-dasharray": 3
    });
}
var DNodeView = (function () {
    function DNodeView(viewer, node, parentView) {
        this.viewer = viewer;
        this.node = node;
        this.parentView = parentView;
        var _this = this;
        this.$div = $("<div></div>").addClass("node-container");
        this.$divName = $("<div></div>").addClass("node-name").appendTo(this.$div);
        this.$divText = $("<div></div>").addClass("node-text").appendTo(this.$div);
        this.$divNodes = $("<div></div>").addClass("node-closednodes").appendTo(this.$div);
        this.children = [];
        this.context = null;
        this.subject = null;
        this.rebuttal = null;
        this.offset = new Point(0, 0);
        this.nodeSize = new Size(DEF_WIDTH, 100);
        this.subtreeBounds = new Rect(0, 0, 0, 0);
        this.subtreeSize = new Size(0, 0);
        this.nodeOffset = 0;
        this.visible = true;
        this.childVisible = true;
        this.selected = false;
        this.hovered = false;
        var $root = viewer.$dom;
        this.$rootsvg = viewer.$svg;
        this.$div.width(DEF_WIDTH).css("left", $(document).width() / viewer.scale).appendTo($root);
        if(parentView != null) {
            if(node.isContext) {
                this.$line = createContextLineElement();
                if(this.node.type == "Subject") {
                    parentView.subject = this;
                } else if(this.node.type == "Rebuttal") {
                    parentView.rebuttal = this;
                } else {
                    parentView.context = this;
                }
            } else {
                this.$line = createChildLineElement();
                parentView.children.push(this);
            }
            this.$rootsvg.append(this.$line);
        }
        this.$div.mouseup(function (e) {
            return _this.viewer.dragEnd(_this);
        });
        this.$div[0].ondragenter = function (e) {
            _this.viewer.setSelectedNode(_this);
        };
        this.$div[0].ondragleave = function (e) {
            _this.viewer.setSelectedNode(null);
        };
        this.$div.hover(function () {
            _this.hovered = true;
            _this.updateColor();
        }, function () {
            _this.hovered = false;
            _this.updateColor();
        });
        this.nodeChanged();
        $.each(viewer.nodeview_addons, function (i, addon) {
            addon(_this);
        });
    }
    DNodeView.prototype.nodeChanged = function () {
        var node = this.node;
        var viewer = this.viewer;
        node.isUndeveloped = (node.type === "Goal" && node.children.length == 0);
        if(node.isUndeveloped && this.$undevel == null) {
            this.$undevel = createUndevelopMarkElement().appendTo(this.$rootsvg);
        } else if(!node.isUndeveloped && this.$undevel != null) {
            this.$undevel.remove();
            this.$undevel = null;
        }
        if(node.isArgument && this.$argBorder == null) {
            this.$argBorder = createArgumentBorderElement().appendTo(this.$rootsvg);
        } else if(!node.isArgument && this.$argBorder != null) {
            this.$argBorder.remove();
            this.$argBorder = null;
        }
        this.$divName.html(node.name);
        this.$divText.html(node.getHtmlDescription());
        this.$divText.append(node.getHtmlMetadata());
        if(this.svgShape) {
            this.svgShape.$g.remove();
        }
        this.svgShape = new GsnShapeMap[node.type]();
        this.$rootsvg.append(this.svgShape.$g);
        var count = node.getNodeCount();
        if(count != 0) {
            this.$divNodes.html(count + " nodes...");
        } else {
            this.$divNodes.html("");
        }
    };
    DNodeView.prototype.updateColor = function () {
        var stroke;
        if(this.selected) {
            stroke = this.viewer.colorSets.colorTheme.selected;
        } else if(this.hovered) {
            stroke = this.viewer.colorSets.colorTheme.hovered;
        } else {
            stroke = this.viewer.colorSets.colorTheme.stroke[this.node.type];
        }
        var fill = this.viewer.colorSets.colorTheme.fill[this.node.type];
        this.svgShape.$g.attr({
            "stroke": stroke,
            "fill": fill
        });
    };
    DNodeView.prototype.remove = function (parentView) {
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
        this.svgShape.$g.remove();
        this.$div.remove();
        if(this.$undevel != null) {
            this.$undevel.remove();
        }
        if(this.$argBorder != null) {
            this.$argBorder.remove();
        }
        if(this.$line != null) {
            this.$line.remove();
        }
        if(this.node.isContext) {
            if(this.node.type == "Subject") {
                parentView.subject = null;
            } else if(this.node.type == "Rebuttal") {
                parentView.rebuttal = null;
            } else {
                parentView.context = null;
            }
        } else {
            parentView.children.splice(parentView.children.indexOf(this), 1);
        }
    };
    DNodeView.prototype.forEachNode = function (f) {
        if(this.context != null) {
            f(this.context);
        }
        if(this.subject != null) {
            f(this.subject);
        }
        if(this.rebuttal != null) {
            f(this.rebuttal);
        }
        $.each(this.children, function (i, view) {
            return f(view);
        });
    };
    DNodeView.prototype.setChildVisible = function (b) {
        if(this.node.getNodeCount() == 0) {
            b = true;
        }
        this.childVisible = b;
    };
    DNodeView.prototype.setChildVisibleAll = function (b) {
        this.setChildVisible(b);
        this.forEachNode(function (view) {
            return view.setChildVisibleAll(b);
        });
    };
    DNodeView.prototype.updateLocation = function (visible) {
        if (typeof visible === "undefined") { visible = true; }
        var ARG_MARGIN = 4;
        var X_MARGIN = 30;
        var Y_MARGIN = 100;
        this.visible = visible;
        var childVisible = visible && this.childVisible;
        this.forEachNode(function (view) {
            return view.updateLocation(childVisible);
        });
        if(!visible) {
            this.subtreeBounds = new Rect(0, 0, 0, 0);
            this.subtreeSize = new Size(0, 0);
            this.nodeOffset = 0;
            this.forEachNode(function (view) {
                return view.offset = new Point(0, 0);
            });
            return;
        }
        var size = this.nodeSize;
        var x0 = 0, y0 = 0, x1 = size.w, y1 = size.h;
        var offY = 0;
        if(!childVisible) {
            this.forEachNode(function (view) {
                return view.offset = new Point(0, 0);
            });
        } else {
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
                this.subject.offset = new Point(-(this.subject.subtreeSize.w + Y_MARGIN), (y1 - this.subject.subtreeSize.h) / 2);
            }
            if(this.context != null) {
                this.context.offset = new Point((this.context.subtreeSize.w + Y_MARGIN), (y1 - this.context.subtreeSize.h - rh) / 2);
            }
            if(this.rebuttal != null) {
                this.rebuttal.offset = new Point((this.rebuttal.subtreeSize.w + Y_MARGIN), (y1 - this.rebuttal.subtreeSize.h + ch) / 2);
            }
            var w2 = 0;
            $.each(this.children, function (i, view) {
                if(i != 0) {
                    w2 += X_MARGIN;
                }
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
            $.each(this.children, function (i, view) {
                if(i != 0) {
                    x += X_MARGIN;
                }
                view.offset = new Point(x, y);
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
        this.subtreeSize = new Size(x1 - x0, y1 - y0);
        this.nodeOffset = offY;
    };
    DNodeView.prototype.getLocation = function () {
        var l = new Point(this.offset.x - this.subtreeBounds.x, this.offset.y + this.nodeOffset);
        if(this.parentView != null) {
            var p = this.parentView.getLocation();
            l.x += p.x;
            l.y += p.y;
        }
        return l;
    };
    DNodeView.prototype.animeStart = function (a, x, y, pb) {
        var parent = this.parentView;
        x -= this.subtreeBounds.x;
        var b = new Rect(x, y + this.nodeOffset, this.nodeSize.w, this.nodeSize.h);
        a.show(this.svgShape.$g[0], this.visible);
        a.show(this.$div, this.visible);
        a.show(this.$divNodes, !this.childVisible);
        this.updateColor();
        var offset = this.svgShape.animate(a, b.x, b.y, b.w, b.h);
        a.moves(this.$div, {
            left: (b.x + offset.w),
            top: (b.y + offset.h),
            width: (b.w - offset.w * 2),
            height: (b.h - offset.h * 2)
        });
        if(this.$line != null) {
            var l = this.$line[0];
            if(!this.node.isContext) {
                var start = (l).pathSegList.getItem(0);
                var curve = (l).pathSegList.getItem(1);
                var x1 = pb.x + pb.w / 2;
                var y1 = pb.y + pb.h;
                var x2 = b.x + b.w / 2;
                var y2 = b.y;
                a.show(l, this.visible);
                a.moves(start, {
                    x: x1,
                    y: y1
                });
                a.moves(curve, {
                    x1: (9 * x1 + x2) / 10,
                    y1: (y1 + y2) / 2,
                    x2: (9 * x2 + x1) / 10,
                    y2: (y1 + y2) / 2,
                    x: x2,
                    y: y2
                });
            } else {
                var n = parent.node.type == "Strategy" ? 10 : 0;
                if(this.node.type != "Subject") {
                    a.moves(l, {
                        x1: pb.x + pb.w - n,
                        y1: pb.y + pb.h / 2,
                        x2: b.x,
                        y2: b.y + b.h / 2
                    });
                } else {
                    a.moves(l, {
                        x1: pb.x,
                        y1: pb.y + pb.h / 2,
                        x2: b.x + b.w - n,
                        y2: b.y + b.h / 2
                    });
                }
                a.show(l, this.visible);
            }
        }
        if(this.$undevel != null) {
            var sx = b.x + b.w / 2;
            var sy = b.y + b.h;
            var n = 20;
            a.show(this.$undevel[0], this.visible);
            a.movePolygon(this.$undevel[0], [
                {
                    x: sx,
                    y: sy
                }, 
                {
                    x: sx - n,
                    y: sy + n
                }, 
                {
                    x: sx,
                    y: sy + n * 2
                }, 
                {
                    x: sx + n,
                    y: sy + n
                }, 
                
            ]);
        }
        if(this.$argBorder != null) {
            var n = 10;
            var sb = this.subtreeBounds;
            a.moves(this.$argBorder[0], {
                x: sb.x + x,
                y: sb.y + y,
                width: sb.w - sb.x,
                height: sb.h - sb.y
            });
            a.show(this.$argBorder[0], this.visible);
        }
        this.forEachNode(function (e) {
            e.animeStart(a, x + e.offset.x, y + e.offset.y, b);
        });
    };
    return DNodeView;
})();
