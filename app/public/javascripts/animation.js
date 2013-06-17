var PropertyAdapter = (function () {
    function PropertyAdapter(get, set) {
        this.get = get;
        this.set = set;
    }
    return PropertyAdapter;
})();
var MoveTask = (function () {
    function MoveTask(key, from, to, target) {
        this.key = key;
        this.from = from;
        this.to = to;
        this.target = target;
    }
    return MoveTask;
})();
var Animation = (function () {
    function Animation(moveList, fadeInList, fadeOutList) {
        this.moveList = moveList;
        this.fadeInList = fadeInList;
        this.fadeOutList = fadeOutList;
        this.moveList = [];
        this.fadeInList = [];
        this.fadeOutList = [];
    }
    Animation.prototype.getAttrSetter = function (dom) {
        if(dom.setAttribute != null) {
            return new PropertyAdapter(function (key) {
                return dom.getAttribute(key);
            }, function (key, value) {
                dom.setAttribute(key, value);
            });
        } else if(dom.css != undefined) {
            return new PropertyAdapter(function (key) {
                return dom.css(key);
            }, function (key, value) {
                dom.css(key, value);
            });
        } else {
            return new PropertyAdapter(function (key) {
                return dom[key];
            }, function (key, value) {
                dom[key] = value;
            });
        }
    };
    Animation.prototype.move = function (dom, key, toValue) {
        var target = this.getAttrSetter(dom);
        var fromValue = target.get(key);
        toValue = Math.floor(toValue);
        if(fromValue != toValue) {
            this.moveList.push(new MoveTask(key, fromValue, toValue, target));
        }
        return this;
    };
    Animation.prototype.moves = function (dom, json) {
        for(var key in json) {
            this.move(dom, key, json[key]);
        }
        return this;
    };
    Animation.prototype.movePolygon = function (dom, points) {
        var from = [];
        for(var i = 0; i < dom.points.numberOfItems; i++) {
            var p = dom.points.getItem(i);
            this.move(p, "x", points[i].x);
            this.move(p, "y", points[i].y);
        }
    };
    Animation.prototype.show = function (dom, visible) {
        var target = this.getAttrSetter(dom);
        var disp = target.get("display");
        if(disp == null) {
            target.set("display", visible ? "block" : "none");
        } else if(disp == "none" && visible) {
            this.fadeInList.push(target);
            target.set("opacity", 0.0);
            target.set("display", "block");
        } else if(disp == "block" && !visible) {
            this.fadeOutList.push(target);
            target.set("opacity", 1.0);
            target.set("display", "block");
        }
        return this;
    };
    Animation.prototype.anime = function (r) {
        $.each(this.moveList, function (i, e) {
            e.target.set(e.key, e.from + (e.to - e.from) * r);
        });
        $.each(this.fadeInList, function (i, e) {
            e.set("opacity", r);
        });
        $.each(this.fadeOutList, function (i, e) {
            e.set("opacity", 1.0 - r);
        });
    };
    Animation.prototype.animeFinish = function () {
        $.each(this.moveList, function (i, e) {
            e.target.set(e.key, e.to);
        });
        $.each(this.fadeInList, function (i, e) {
            e.set("opacity", 1.0);
        });
        $.each(this.fadeOutList, function (i, e) {
            e.set("opacity", 1.0);
            e.set("display", "none");
        });
    };
    return Animation;
})();
