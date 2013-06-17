///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

var SVG_NS = "http://www.w3.org/2000/svg";

class Point {
	public w: number;
	public h: number;
	constructor (
		public x: number,
		public y: number
	) {
		this.w = x;	//TODO
		this.h = y;
	}
}

interface Animation {
	moves(dom: any, map: any);
	movePolygon(dom: any, map: any);
}

interface GsnShape {
	animate(a: Animation, x: number, y: number, w: number, h: number): Point;
	outer(w: number, h: number): Point;
}

class GoalShape implements GsnShape {
	N = 10;

	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "rect");
		$svg.append(this[0]);
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].setAttribute("transform", "translate(0,0)");
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this[2], { x: 0, y: 0, width : w, height: h });
		return new Point(this.N, this.N);
	}

	outer(w: number, h: number): Point {
		return new Point(w + this.N*2, h + this.N*2);
	}
}

class ContextShape implements GsnShape {
	N = 20;
	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "rect");
		$svg.append(this[0]);
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].setAttribute("transform", "translate(0,0)");
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this[2], {
			rx: this.N, ry: this.N, x: 0, y: 0, width: w, height: h
		});
		return new Point(this.N/2, this.N/2);
	}

	outer(w: number, h: number): Point {
		return new Point(w + this.N, h + this.N);
	}
}

class SubjectShape implements GsnShape {
	N = 20;
	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "rect");
		this[3] = document.createElementNS(SVG_NS, "polygon");
		$svg.append(this[0]);
		$(this[3]).attr("fill", "gray").attr("points", "0,0 0,0 0,0");
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].appendChild(this[3]);
		this[0].setAttribute("transform", "translate(0,0)");
	}
	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this[2], {
			rx: this.N, ry: this.N, x : 0, y : 0, width : w, height: h
		});
		a.movePolygon(this[3], [
			{ x: w*5/8, y:-this.N },
			{ x: w*5/8, y:+this.N },
			{ x: w*5/8+this.N*2, y:0 },
		]);
		return new Point(this.N/2, this.N/2);
	}
	outer(w: number, h: number): Point {
		return new Point(w + this.N, h + this.N);
	}
}

class StrategyShape implements GsnShape {
	N = 20;
	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "polygon");
		$(this[2]).attr("points", "0,0 0,0 0,0 0,0");
		$svg.append(this[0]);
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].setAttribute("transform", "translate(0,0)");
	}
	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.movePolygon(this[2], [
			{ x: this.N, y: 0 },
			{ x: w, y: 0 },
			{ x: w-this.N, y: h },
			{ x: 0, y: h }
		]);
		return new Point(this.N * 1.5, this.N / 2);
	}
	outer(w: number, h: number): Point {
		return new Point(w + this.N*2, h + this.N);
	}
}

class EvidenceShape implements GsnShape {
	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "ellipse");
		$svg.append(this[0]);
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].setAttribute("transform", "translate(0,0)");
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this[2], {
			cx: w/2, cy: h/2,
			rx: w/2, ry: h/2,
		});
		return new Point(w/6, h/6);
	}

	outer(w: number, h: number): Point {
		return new Point(w*8/6, h*8/6);
	}
}

class SolutionShape implements GsnShape {
	N = 20;
	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "ellipse");
		this[3] = document.createElementNS(SVG_NS, "polygon");
		$svg.append(this[0]);
		$(this[3]).attr("fill", "gray").attr("points", "0,0 0,0 0,0");
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].appendChild(this[3]);
		this[0].setAttribute("transform", "translate(0,0)");
	}
	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this[2], {
			cx: w/2, cy: h/2,
			rx: w/2, ry: h/2,
		});
		a.movePolygon(this[3], [
			{ x: w*5/8, y:-this.N },
			{ x: w*5/8, y:this.N },
			{ x: w*5/8+this.N*2, y:0 },
		]);
		return new Point(w/6, h/6);
	}
	outer(w: number, h: number): Point {
		return new Point(w*8/6, h*8/6);
	}
}

class MonitorShape implements GsnShape {
	N = 20;

	constructor($svg) {
		this[0] = document.createElementNS(SVG_NS, "g");
		this[1] = document.createElementNS(SVG_NS, "foreignObject");
		this[2] = document.createElementNS(SVG_NS, "ellipse");
		this[3] = document.createElementNS(SVG_NS, "text");
		$svg.append(this[0]);
		$(this[3]).attr("fill", "gray").attr("font-size", "50").text("M");
		this[0].appendChild(this[1]);
		this[0].appendChild(this[2]);
		this[0].appendChild(this[3]);
		this[0].setAttribute("transform", "translate(0,0)");
	}
	animate(a: Animation, x: number, y: number, w: number, h: number): Point {
		a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this[2], {
			cx: w/2, cy: h/2,
			rx: w/2, ry: h/2,
		});
		a.moves(this[3], { x: w*5/8, y:this.N });
		return new Point(w/6, h/6);
	}
	outer(w: number, h: number): Point {
		return new Point(w*8/6, h*8/6);
	}
}

var GsnShapeMap = {
	"Goal"    : GoalShape,
	"Context" : ContextShape,
	"Subject" : SubjectShape,
	"Strategy": StrategyShape,
	"Evidence": EvidenceShape,
	"Solution": SolutionShape,
	"Rebuttal": EvidenceShape,
	"Monitor" : MonitorShape
};

