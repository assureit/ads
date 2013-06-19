var Rectangle = (function () {
    function Rectangle(l, r, t, b) {
        this.l = l;
        this.r = r;
        this.t = t;
        this.b = b;
    }
    return Rectangle;
})();
var PointerHandler = (function () {
    function PointerHandler(viewer) {
        this.viewer = null;
        this.x0 = 0;
        this.y0 = 0;
        this.bounds = new Rectangle(0, 0, 0, 0);
        this.mainPointerId = null;
        this.pointers = [];
        this.root = null;
        this.viewer = viewer;
        this.root = viewer.$dummyDivForPointer;
        this.scale0 = this.viewer.scale;
        this.root[0].addEventListener("pointerdown", this.onPointerDown(), false);
        this.root[0].addEventListener("pointermove", this.onPointerMove(), false);
        this.root[0].addEventListener("pointerup", this.onPointerUp(), false);
        this.root[0].addEventListener("gesturescale", this.onScale(), false);
        this.root.mousewheel(this.onWheel);
    }
    PointerHandler.prototype.dragStart = function (x, y) {
        console.log("dragStart");
        if(this.viewer.rootview == null) {
            return;
        }
        this.x0 = x;
        this.y0 = y;
        var size = this.viewer.treeSize();
        this.bounds = new Rectangle(20 - size.w * this.viewer.scale - this.viewer.shiftX, this.viewer.$root.width() - 20 - this.viewer.shiftX, 20 - size.h * this.viewer.scale - this.viewer.shiftY, this.viewer.$root.height() - 20 - this.viewer.shiftY);
        this.viewer.repaintAll(0);
    };
    PointerHandler.prototype.drag = function (x, y) {
        console.log("drag");
        var dx = (x - this.x0);
        var dy = (y - this.y0);
        if(dx != 0 || dy != 0) {
            this.viewer.dragX = Math.max(this.bounds.l, Math.min(this.bounds.r, dx));
            this.viewer.dragY = Math.max(this.bounds.t, Math.min(this.bounds.b, dy));
            this.viewer.repaintAll(0);
        }
    };
    PointerHandler.prototype.dragCancel = function () {
        console.log("dragCansel");
        this.viewer.shiftX += this.viewer.dragX;
        this.viewer.shiftY += this.viewer.dragY;
        this.viewer.dragX = 0;
        this.viewer.dragY = 0;
        this.viewer.repaintAll(0);
    };
    PointerHandler.prototype.dragEnd = function (view) {
        console.log("dragEnd");
        if(this.viewer.dragX == 0 && this.viewer.dragY == 0) {
            this.viewer.setSelectedNode(view);
        } else {
            this.viewer.shiftX += this.viewer.dragX;
            this.viewer.shiftY += this.viewer.dragY;
            this.viewer.dragX = 0;
            this.viewer.dragY = 0;
            this.viewer.repaintAll(0);
        }
    };
    PointerHandler.prototype.getMainPointer = function () {
        for(var i = 0; i < this.pointers.length; ++i) {
            if(this.pointers[i].identifier === this.mainPointerId) {
                return this.pointers[i];
            }
        }
        ;
        return null;
    };
    PointerHandler.prototype.onPointerDown = function () {
        var _this = this;
        return function (e) {
            _this.pointers = e.getPointerList();
            e.preventDefault();
            _this.scale0 = _this.viewer.scale;
        };
    };
    PointerHandler.prototype.onPointerMove = function () {
        var _this = this;
        return function (e) {
            e.preventDefault();
            _this.pointers = e.getPointerList();
            if(!_this.mainPointerId && _this.pointers.length > 0) {
                var mainPointer = _this.pointers[0];
                _this.mainPointerId = mainPointer.identifier;
                _this.dragStart(mainPointer.pageX, mainPointer.pageY);
            } else {
                var mainPointer = _this.getMainPointer();
                if(mainPointer) {
                    _this.drag(mainPointer.pageX, mainPointer.pageY);
                }
            }
        };
    };
    PointerHandler.prototype.onPointerUp = function () {
        var _this = this;
        return function (e) {
            _this.pointers = e.getPointerList();
            var mainPointer = _this.getMainPointer();
            if(_this.mainPointerId && !mainPointer) {
                _this.viewer.dragEnd(_this.viewer);
                _this.mainPointerId = null;
            }
        };
    };
    PointerHandler.prototype.getRect = function () {
        return (this.root[0]).getBoundingClientRect();
    };
    PointerHandler.prototype.setScale = function (cx, cy, b) {
        var scale = Math.min(Math.max(this.viewer.scale * b, SCALE_MIN), SCALE_MAX);
        var r = this.getRect();
        var x1 = cx - r.left;
        var y1 = cy - r.top;
        var x = x1 - (x1 - this.viewer.shiftX) * b;
        var y = y1 - (y1 - this.viewer.shiftY) * b;
        this.viewer.setLocation(x, y, scale, 0);
    };
    PointerHandler.prototype.onScale = function () {
        var _this = this;
        return function (e) {
            e.preventDefault();
            e.stopPropagation();
            if(_this.viewer.moving) {
                return;
            }
            var b = e.scale * _this.scale0 / _this.viewer.scale;
            _this.setScale(e.centerX, e.centerY, b);
        };
    };
    PointerHandler.prototype.onWheel = function () {
        var _this = this;
        return function (e, delta) {
            e.preventDefault();
            e.stopPropagation();
            if(_this.viewer.moving) {
                return;
            }
            var b = 1.0 + delta * 0.04;
            _this.setScale(e.pageX, e.pageY, b);
        };
    };
    return PointerHandler;
})();
