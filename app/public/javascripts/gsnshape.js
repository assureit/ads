var SVG_NS = "http://www.w3.org/2000/svg";
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var Size = (function () {
    function Size(w, h) {
        this.w = w;
        this.h = h;
    }
    return Size;
})();
var Rect = (function () {
    function Rect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return Rect;
})();
var GoalShape = (function () {
    function GoalShape($svg) {
        this.N = 10;
        this[0] = document.createElementNS(SVG_NS, "g");
        this[1] = document.createElementNS(SVG_NS, "foreignObject");
        this[2] = document.createElementNS(SVG_NS, "rect");
        $svg.append(this[0]);
        this[0].appendChild(this[1]);
        this[0].appendChild(this[2]);
        this[0].setAttribute("transform", "translate(0,0)");
    }
    GoalShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.moves(this[2], {
            x: 0,
            y: 0,
            width: w,
            height: h
        });
        return new Size(this.N, this.N);
    };
    GoalShape.prototype.outer = function (w, h) {
        return new Size(w + this.N * 2, h + this.N * 2);
    };
    return GoalShape;
})();
var ContextShape = (function () {
    function ContextShape($svg) {
        this.N = 20;
        this[0] = document.createElementNS(SVG_NS, "g");
        this[1] = document.createElementNS(SVG_NS, "foreignObject");
        this[2] = document.createElementNS(SVG_NS, "rect");
        $svg.append(this[0]);
        this[0].appendChild(this[1]);
        this[0].appendChild(this[2]);
        this[0].setAttribute("transform", "translate(0,0)");
    }
    ContextShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.moves(this[2], {
            rx: this.N,
            ry: this.N,
            x: 0,
            y: 0,
            width: w,
            height: h
        });
        return new Size(this.N / 2, this.N / 2);
    };
    ContextShape.prototype.outer = function (w, h) {
        return new Size(w + this.N, h + this.N);
    };
    return ContextShape;
})();
var SubjectShape = (function () {
    function SubjectShape($svg) {
        this.N = 20;
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
    SubjectShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.moves(this[2], {
            rx: this.N,
            ry: this.N,
            x: 0,
            y: 0,
            width: w,
            height: h
        });
        a.movePolygon(this[3], [
            {
                x: w * 5 / 8,
                y: -this.N
            }, 
            {
                x: w * 5 / 8,
                y: +this.N
            }, 
            {
                x: w * 5 / 8 + this.N * 2,
                y: 0
            }, 
            
        ]);
        return new Size(this.N / 2, this.N / 2);
    };
    SubjectShape.prototype.outer = function (w, h) {
        return new Size(w + this.N, h + this.N);
    };
    return SubjectShape;
})();
var StrategyShape = (function () {
    function StrategyShape($svg) {
        this.N = 20;
        this[0] = document.createElementNS(SVG_NS, "g");
        this[1] = document.createElementNS(SVG_NS, "foreignObject");
        this[2] = document.createElementNS(SVG_NS, "polygon");
        $(this[2]).attr("points", "0,0 0,0 0,0 0,0");
        $svg.append(this[0]);
        this[0].appendChild(this[1]);
        this[0].appendChild(this[2]);
        this[0].setAttribute("transform", "translate(0,0)");
    }
    StrategyShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.movePolygon(this[2], [
            {
                x: this.N,
                y: 0
            }, 
            {
                x: w,
                y: 0
            }, 
            {
                x: w - this.N,
                y: h
            }, 
            {
                x: 0,
                y: h
            }
        ]);
        return new Size(this.N * 1.5, this.N / 2);
    };
    StrategyShape.prototype.outer = function (w, h) {
        return new Size(w + this.N * 2, h + this.N);
    };
    return StrategyShape;
})();
var EvidenceShape = (function () {
    function EvidenceShape($svg) {
        this[0] = document.createElementNS(SVG_NS, "g");
        this[1] = document.createElementNS(SVG_NS, "foreignObject");
        this[2] = document.createElementNS(SVG_NS, "ellipse");
        $svg.append(this[0]);
        this[0].appendChild(this[1]);
        this[0].appendChild(this[2]);
        this[0].setAttribute("transform", "translate(0,0)");
    }
    EvidenceShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.moves(this[2], {
            cx: w / 2,
            cy: h / 2,
            rx: w / 2,
            ry: h / 2
        });
        return new Size(w / 6, h / 6);
    };
    EvidenceShape.prototype.outer = function (w, h) {
        return new Size(w * 8 / 6, h * 8 / 6);
    };
    return EvidenceShape;
})();
var SolutionShape = (function () {
    function SolutionShape($svg) {
        this.N = 20;
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
    SolutionShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.moves(this[2], {
            cx: w / 2,
            cy: h / 2,
            rx: w / 2,
            ry: h / 2
        });
        a.movePolygon(this[3], [
            {
                x: w * 5 / 8,
                y: -this.N
            }, 
            {
                x: w * 5 / 8,
                y: this.N
            }, 
            {
                x: w * 5 / 8 + this.N * 2,
                y: 0
            }, 
            
        ]);
        return new Size(w / 6, h / 6);
    };
    SolutionShape.prototype.outer = function (w, h) {
        return new Size(w * 8 / 6, h * 8 / 6);
    };
    return SolutionShape;
})();
var MonitorShape = (function () {
    function MonitorShape($svg) {
        this.N = 20;
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
    MonitorShape.prototype.animate = function (a, x, y, w, h) {
        a.moves(this[0].transform.baseVal.getItem(0).matrix, {
            e: x,
            f: y
        });
        a.moves(this[2], {
            cx: w / 2,
            cy: h / 2,
            rx: w / 2,
            ry: h / 2
        });
        a.moves(this[3], {
            x: w * 5 / 8,
            y: this.N
        });
        return new Size(w / 6, h / 6);
    };
    MonitorShape.prototype.outer = function (w, h) {
        return new Size(w * 8 / 6, h * 8 / 6);
    };
    return MonitorShape;
})();
var GsnShapeMap = {
    "Goal": GoalShape,
    "Context": ContextShape,
    "Subject": SubjectShape,
    "Strategy": StrategyShape,
    "Evidence": EvidenceShape,
    "Solution": SolutionShape,
    "Rebuttal": EvidenceShape,
    "Monitor": MonitorShape
};
