var GsnShape = {
	"Goal": (function() {
		var N = 10;
		var Goal = function($svg) {
			this[0] = document.createElementNS(SVG_NS, "g");
			this[1] = document.createElementNS(SVG_NS, "foreignObject");
			this[2] = document.createElementNS(SVG_NS, "rect");
			$svg.append(this[0]);
			this[0].appendChild(this[1]);
			this[0].appendChild(this[2]);
			this[0].setAttribute("transform", "translate(0,0)");
		};
		Goal.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.moves(this[2], { x: 0, y: 0, width : w, height: h });
			return { x: N, y: N };//offset
		};
		Goal.prototype.outer = function(w, h) {
			return { w: w + N*2, h: h + N*2 };
		};
		return Goal;
	}()),
	"Context": (function() {
		var N = 20;
		var Context = function($svg) {
			this[0] = document.createElementNS(SVG_NS, "g");
			this[1] = document.createElementNS(SVG_NS, "foreignObject");
			this[2] = document.createElementNS(SVG_NS, "rect");
			$svg.append(this[0]);
			this[0].appendChild(this[1]);
			this[0].appendChild(this[2]);
			this[0].setAttribute("transform", "translate(0,0)");
		};
		Context.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.moves(this[2], {
				rx: N, ry: N, x: 0, y: 0, width: w, height: h
			});
			return { x: N/2, y: N/2};
		};
		Context.prototype.outer = function(w, h) {
			return { w: w + N, h: h + N };
		};
		return Context;
	}()),
	"Subject": (function() {
		var N = 20;
		var Subject = function($svg) {
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
		};
		Subject.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.moves(this[2], {
				rx: N, ry: N, x : 0, y : 0, width : w, height: h
			});
			a.movePolygon(this[3], [
				{ x: w*5/8, y:-N },
				{ x: w*5/8, y:+N },
				{ x: w*5/8+N*2, y:0 },
			]);
			return  { x: N/2, y: N/2 };
		};
		Subject.prototype.outer = function(w, h) {
			return { w: w + N, h: h + N };
		};
		return Subject;
	}()),
	"Strategy": (function() {
		var N = 20;
		var Strategy = function($svg) {
			this[0] = document.createElementNS(SVG_NS, "g");
			this[1] = document.createElementNS(SVG_NS, "foreignObject");
			this[2] = document.createElementNS(SVG_NS, "polygon");
			$(this[2]).attr("points", "0,0 0,0 0,0 0,0");
			$svg.append(this[0]);
			this[0].appendChild(this[1]);
			this[0].appendChild(this[2]);
			this[0].setAttribute("transform", "translate(0,0)");
		};
		Strategy.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.movePolygon(this[2], [
				{ x: N, y: 0 },
				{ x: w, y: 0 },
				{ x: w-N, y: h },
				{ x: 0, y: h }
			]);
			return { x: N * 1.5, y: N / 2 };
		};
		Strategy.prototype.outer = function(w, h) {
			return { w: w + N*2, h: h + N };
		};
		return Strategy;
	}()),
	"Evidence": (function() {
		var Evidence = function($svg) {
			this[0] = document.createElementNS(SVG_NS, "g");
			this[1] = document.createElementNS(SVG_NS, "foreignObject");
			this[2] = document.createElementNS(SVG_NS, "ellipse");
			$svg.append(this[0]);
			this[0].appendChild(this[1]);
			this[0].appendChild(this[2]);
			this[0].setAttribute("transform", "translate(0,0)");
		};
		Evidence.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.moves(this[2], {
				cx: w/2, cy: h/2,
				rx: w/2, ry: h/2,
			});
			return { x: w/6, y: h/6 };
		};
		Evidence.prototype.outer = function(w, h) {
			return { w: w*8/6, h: h*8/6 };
		};
		return Evidence;
	}()),
	"Solution": (function() {
		var N = 20;
		var Solution = function($svg) {
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
		};
		Solution.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.moves(this[2], {
				cx: w/2, cy: h/2,
				rx: w/2, ry: h/2,
			});
			a.movePolygon(this[3], [
				{ x: w*5/8, y:-N },
				{ x: w*5/8, y:N },
				{ x: w*5/8+N*2, y:0 },
			]);
			return { x: w/6, y: h/6 };
		};
		Solution.prototype.outer = function(w, h) {
			return { w: w*8/6, h: h*8/6 };
		};
		return Solution;
	}()),
	"Monitor": (function() {
		var N = 20;
		var Monitor = function($svg) {
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
		};
		Monitor.prototype.animate = function(a, x, y, w, h) {
			a.moves(this[0].transform.baseVal.getItem(0).matrix, { e: x, f: y });
			a.moves(this[2], {
				cx: w/2, cy: h/2,
				rx: w/2, ry: h/2,
			});
			a.moves(this[3], { x: w*5/8, y:N });
			return { x: w/6, y: h/6 };
		};
		Monitor.prototype.outer = function(w, h) {
			return { w: w*8/6, h: h*8/6 };
		};
		return Monitor;
	}()),
};

GsnShape["Rebuttal"] = GsnShape["Evidence"];

