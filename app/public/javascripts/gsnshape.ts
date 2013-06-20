///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

var SVG_NS = "http://www.w3.org/2000/svg";

class Point {
	constructor (
		public x: number,
		public y: number
	) {}
}

class Size {
	constructor (
		public w: number,
		public h: number
	) {}
}

class Rect {
	constructor(
		public x: number,
		public y: number,
		public w: number,
		public h: number,
	) {}
}

interface GsnShape {
	$g: JQuery; // contains all svg element
	animate(a: Animation, x: number, y: number, w: number, h: number): Size;
	outer(w: number, h: number): Size;
}

class GoalShape implements GsnShape {
	N = 10;
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$rect = $(document.createElementNS(SVG_NS, "rect"));

	constructor() {
		this.$g.append(this.$rect);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this.$rect[0], { x: 0, y: 0, width : w, height: h });
		return new Size(this.N, this.N);
	}

	outer(w: number, h: number): Size {
		return new Size(w + this.N*2, h + this.N*2);
	}
}

class ContextShape implements GsnShape {
	N = 20;
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$rect = $(document.createElementNS(SVG_NS, "rect"));

	constructor() {
		this.$g.append(this.$rect);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this.$rect[0], {
			rx: this.N, ry: this.N, x: 0, y: 0, width: w, height: h
		});
		return new Size(this.N/2, this.N/2);
	}

	outer(w: number, h: number): Size {
		return new Size(w + this.N, h + this.N);
	}
}

class SubjectShape implements GsnShape {
	N = 20;
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$rect = $(document.createElementNS(SVG_NS, "rect"));
	$poly = $(document.createElementNS(SVG_NS, "polygon"))
				.attr("fill", "gray").attr("points", "0,0 0,0 0,0");

	constructor() {
		this.$g.append(this.$rect).append(this.$poly);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this.$rect[0], {
			rx: this.N, ry: this.N, x : 0, y : 0, width : w, height: h
		});
		a.movePolygon(this.$poly[0], [
			{ x: w*5/8, y:-this.N },
			{ x: w*5/8, y:+this.N },
			{ x: w*5/8+this.N*2, y:0 },
		]);
		return new Size(this.N/2, this.N/2);
	}

	outer(w: number, h: number): Size {
		return new Size(w + this.N, h + this.N);
	}
}

class StrategyShape implements GsnShape {
	N = 20;
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$poly = $(document.createElementNS(SVG_NS, "polygon"))
				.attr("points", "0,0 0,0 0,0 0,0");

	constructor() {
		this.$g.append(this.$poly);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.movePolygon(this.$poly[0], [
			{ x: this.N, y: 0 },
			{ x: w, y: 0 },
			{ x: w-this.N, y: h },
			{ x: 0, y: h }
		]);
		return new Size(this.N * 1.5, this.N / 2);
	}

	outer(w: number, h: number): Size {
		return new Size(w + this.N*2, h + this.N);
	}
}

class EvidenceShape implements GsnShape {
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$ellipse = $(document.createElementNS(SVG_NS, "ellipse"));

	constructor() {
		this.$g.append(this.$ellipse);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this.$ellipse[0], {
			cx: w/2, cy: h/2,
			rx: w/2, ry: h/2,
		});
		return new Size(w/6, h/6);
	}

	outer(w: number, h: number): Size {
		return new Size(w*8/6, h*8/6);
	}
}

class SolutionShape implements GsnShape {
	N = 20;
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$ellipse = $(document.createElementNS(SVG_NS, "ellipse"));
	$poly = $(document.createElementNS(SVG_NS, "polygon"))
			.attr("fill", "gray").attr("points", "0,0 0,0 0,0");

	constructor() {
		this.$g.append(this.$ellipse).append(this.$poly);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this.$ellipse[0], {
			cx: w/2, cy: h/2,
			rx: w/2, ry: h/2,
		});
		a.movePolygon(this.$poly[0], [
			{ x: w*5/8, y:-this.N },
			{ x: w*5/8, y:this.N },
			{ x: w*5/8+this.N*2, y:0 },
		]);
		return new Size(w/6, h/6);
	}

	outer(w: number, h: number): Size {
		return new Size(w*8/6, h*8/6);
	}
}

class MonitorShape implements GsnShape {
	N = 20;
	$g = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(0,0)");
	//$fo = document.createElementNS(SVG_NS, "foreignObject");
	$ellipse = $(document.createElementNS(SVG_NS, "ellipse"));
	$text = $(document.createElementNS(SVG_NS, "text"))
			.attr("fill", "gray").attr("font-size", "50").text("M");

	constructor() {
		this.$g.append(this.$ellipse).append(this.$text);
	}

	animate(a: Animation, x: number, y: number, w: number, h: number): Size {
		a.moves((<any>this.$g[0]).transform.baseVal.getItem(0).matrix, { e: x, f: y });
		a.moves(this.$ellipse[0], {
			cx: w/2, cy: h/2,
			rx: w/2, ry: h/2,
		});
		a.moves(this.$text[0], { x: w*5/8, y:this.N });
		return new Size(w/6, h/6);
	}

	outer(w: number, h: number): Size {
		return new Size(w*8/6, h*8/6);
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

