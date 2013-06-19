///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='./dcaseviewer.ts'/>

// <!-- for pointer.js

declare interface Pointer {
	clientX: number;
	clientY: number;
	screenX: number;
	screenY: number;
	pageX: number;
	pageY: number;
	tiltX: number;
	tiltY: number;
	pressure: number;
	hwTimestamp: number;
	pointerType: string;
	identifier: number;
}

declare interface PointerEvent extends Event {
	getPointerList(): Pointer[];
}

declare interface GestureScaleEvent extends Event {
	centerX: number;
	centerY: number;
	scale: number;
}

// for pointer.js -->

class Rectangle {
	constructor(public l: number, public r: number, public t: number, public b: number) {}
}

class PointerHandler {
	viewer: DCaseViewer = null;
	x0: number = 0;
	y0: number = 0;
	bounds: Rectangle = new Rectangle(0, 0, 0, 0);
	mainPointerId: number = null;
	pointers: Pointer[] = [];
	scale0: number;
	root: JQuery = null;

	constructor(viewer: DCaseViewer) {
		this.viewer = viewer;
		this.root = viewer.$dummyDivForPointer;
		this.scale0 = this.viewer.scale;

		this.root[0].addEventListener("pointerdown", this.onPointerDown(), false);
		this.root[0].addEventListener("pointermove", this.onPointerMove(), false);
		this.root[0].addEventListener("pointerup", this.onPointerUp(), false);
		this.root[0].addEventListener("gesturescale", this.onScale(), false);
		this.root.mousewheel(this.onWheel());
	}

	dragStart(x: number, y: number): void {
		if (this.viewer.rootview == null) return;
		this.x0 = x;
		this.y0 = y;
		var size = this.viewer.treeSize();
		this.bounds = new Rectangle(
				20 - size.w * this.viewer.scale - this.viewer.shiftX,
				this.viewer.$root.width() - 20 - this.viewer.shiftX,
				20 - size.h * this.viewer.scale - this.viewer.shiftY,
				this.viewer.$root.height() - 20 - this.viewer.shiftY
				);
		this.viewer.repaintAll(0);
	}

	drag(x: number, y: number): void {
		var dx = (x - this.x0);
		var dy = (y - this.y0);
		if (dx != 0 || dy != 0) {
			this.viewer.dragX = Math.max(this.bounds.l, Math.min(this.bounds.r, dx));
			this.viewer.dragY = Math.max(this.bounds.t, Math.min(this.bounds.b, dy));
			this.viewer.repaintAll(0);
		}
	}

	dragCancel(): void {
		this.viewer.shiftX += this.viewer.dragX;
		this.viewer.shiftY += this.viewer.dragY;
		this.viewer.dragX = 0;
		this.viewer.dragY = 0;
		this.viewer.repaintAll(0);
	}

	dragEnd(view): void {
		if (this.viewer.dragX == 0 && this.viewer.dragY == 0) {
			this.viewer.setSelectedNode(view);
		} else {
			this.viewer.shiftX += this.viewer.dragX;
			this.viewer.shiftY += this.viewer.dragY;
			this.viewer.dragX = 0;
			this.viewer.dragY = 0;
			this.viewer.repaintAll(0);
		}
	}

	getMainPointer(): Pointer {
		for (var i = 0; i < this.pointers.length; ++i) {
			if (this.pointers[i].identifier === this.mainPointerId) {
				return this.pointers[i]
			}
		};
		return null;
	}

	onPointerDown(): (e: PointerEvent) => void {
		return (e: PointerEvent) => {
			this.pointers = e.getPointerList();
			e.preventDefault();
			this.scale0 = this.viewer.scale;
		}
	}

	onPointerMove(): (e: PointerEvent) => void {
		// Prevent the browser from doing its default thing (scroll, zoom)
		return (e: PointerEvent) => {
			e.preventDefault();
			this.pointers = e.getPointerList();
			if (!this.mainPointerId && this.pointers.length > 0) {
				var mainPointer = this.pointers[0];
				this.mainPointerId = mainPointer.identifier;
				this.dragStart(mainPointer.pageX, mainPointer.pageY);
			} else {
				var mainPointer = this.getMainPointer();
				if (mainPointer) {
					this.drag(mainPointer.pageX, mainPointer.pageY);
				}
			}
		};
	}

	onPointerUp(): (e: PointerEvent) => void {
		return (e: PointerEvent) => {
			this.pointers = e.getPointerList();
			var mainPointer = this.getMainPointer();
			if (this.mainPointerId && !mainPointer) {
				this.viewer.dragEnd(this.viewer);
				this.mainPointerId = null;
			}
		};
	}

	getRect(): ClientRect {
		return (<HTMLElement>this.root[0]).getBoundingClientRect();
	}

	setScale(cx: number, cy: number, b: number): void {
		//console.log("{" + cx + ", " + cy + "} , x"+b);
		var scale = Math.min(Math.max(this.viewer.scale * b, SCALE_MIN), SCALE_MAX);
		var r = this.getRect();
		var x1 = cx - r.left;
		var y1 = cy - r.top;
		var x = x1 - (x1 - this.viewer.shiftX) * b;
		var y = y1 - (y1 - this.viewer.shiftY) * b;
		this.viewer.setLocation(x, y, scale, 0);
	}

	onScale(): (e: GestureScaleEvent) => void {
		return (e: GestureScaleEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (this.viewer.moving) return;
			var b = e.scale * this.scale0 / this.viewer.scale;
			this.setScale(e.centerX, e.centerY, b);
		};
	}

	onWheel(): (e: MouseEvent, delta: number) => void {
		return (e: MouseEvent, delta: number) => {
			e.preventDefault();
			e.stopPropagation();
			if (this.viewer.moving) return;
			var b = 1.0 + delta * 0.04;
			this.setScale(e.pageX, e.pageY, b);
		};
	}
}

