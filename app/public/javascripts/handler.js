DCaseViewer.prototype.setDragHandler = function() {
	var self = this;
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	var bounds = {};

	this.dragStart = function(x, y) {
		if(flag) {
			this.dragCancel();
		}
		if(self.rootview == null) return;
		x0 = x;
		y0 = y;
		flag = true;
		var size = self.treeSize();
		bounds = {
			l : 20 - size.w * self.scale - self.shiftX,
			r : self.$root.width() - 20 - self.shiftX,
			t : 20 - size.h * self.scale - self.shiftY,
			b : self.$root.height() - 20 - self.shiftY
		};
		self.repaintAll(0);
	}
	this.drag = function(x, y) {
		if(flag) {
			var dx = (x - x0);
			var dy = (y - y0);
			if(dx != 0 || dy != 0) {
				self.dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
				self.dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
				self.repaintAll(0);
			}
		}
	}

	this.dragCancel = function() {
		self.shiftX += self.dragX;
		self.shiftY += self.dragY;
		self.dragX = 0;
		self.dragY = 0;
		self.repaintAll(0);
		flag = false;
	}

	this.dragEnd = function(view) {
		if(flag) {
			if(self.dragX == 0 && self.dragY == 0) {
				self.setSelectedNode(view);
			} else {
				self.shiftX += self.dragX;
				self.shiftY += self.dragY;
				self.dragX = 0;
				self.dragY = 0;
				self.repaintAll(0);
			}
			flag = false;
		}
	}
}

DCaseViewer.prototype.setPointerHandler = function() {
	var self = this;
	var root = this.$dummyDivForPointer;
	var pointers = [];
	var mainPointerId = null;
	var scale0 = self.scale;

	var getMainPointer =function(){
		for(var i = 0; i < pointers.length; ++i) {
			if(pointers[i].identifier === mainPointerId){
				return pointers[i]
			}
		};
		return null;
	}

	function onPointerDown(e) {
		pointers = e.getPointerList();
		e.preventDefault();
		scale0 = self.scale;
	}

	function onPointerMove(e) {
		// Prevent the browser from doing its default thing (scroll, zoom)
		e.preventDefault();
		pointers = e.getPointerList();
		if(!mainPointerId && pointers.length > 0){
			var mainPointer = pointers[0];
			mainPointerId = mainPointer.identifier;
			self.dragStart(mainPointer.pageX, mainPointer.pageY);
		}else{
			var mainPointer = getMainPointer();
			if(mainPointer){
				self.drag(mainPointer.pageX, mainPointer.pageY);
			}
		}
	} 

	function onPointerUp(e) {
		pointers = e.getPointerList(); 
		var mainPointer = getMainPointer();
		if(mainPointerId && !mainPointer){
			self.dragEnd();
			mainPointerId = null;
		}
	}
	
	var getRect = function(){ return root[0].getBoundingClientRect(); };

	var setScale = function(cx, cy, b){
		//console.log("{" + cx + ", " + cy + "} , x"+b);
		var scale = Math.min(Math.max(self.scale * b, SCALE_MIN), SCALE_MAX);
		var r = getRect();
		var x1 = cx - r.left;
		var y1 = cy - r.top;
		var x = x1 - (x1 - self.shiftX) * b;
		var y = y1 - (y1 - self.shiftY) * b;
		self.setLocation(x, y, scale);
	};

	$(root).mousewheel(function(e, delta) {
		e.preventDefault();
		e.stopPropagation();
		if(self.moving) return;
		var b = 1.0 + delta * 0.04;
		setScale(e.pageX, e.pageY, b);
	});

	var onScale = function(e) {
		e.preventDefault();
		e.stopPropagation();
		if(self.moving) return;
		var b = e.scale * scale0 / self.scale;
		setScale(e.centerX, e.centerY, b);
	};

	root[0].addEventListener("pointerdown", onPointerDown, false);
	root[0].addEventListener("pointermove", onPointerMove, false);
	root[0].addEventListener("pointerup", onPointerUp, false);
	root[0].addEventListener("gesturescale", onScale, false);
}

DCaseViewer.prototype.addEventHandler = function() {
	this.setDragHandler();
	this.setPointerHandler();
}

