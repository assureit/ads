var Animation = (function() {
	function Animation() {
		this.moveList = [];
		this.fadeInList = [];
		this.fadeOutList = [];
	}

	function getAttrSetter(dom) {
		if(dom.setAttribute != null) {//FIXME?
			return {
				set: function(key, value) { dom.setAttribute(key, value); },
				get: function(key) { return dom.getAttribute(key); }
			};
		} else if(dom.css != undefined){
			return {
				set: function(key, value) { dom.css(key, value); },
				get: function(key) { return dom.css(key); }
			};
		} else {
			return {
				set: function(key, value) { dom[key] = value; },
				get: function(key) { return dom[key]; }
			};
		}
	}

	Animation.prototype.move = function(dom, key, toValue) {
		var mtd = getAttrSetter(dom);
		var fromValue = parseInt(mtd.get(key));
		toValue = Math.floor(toValue);
		if(fromValue != toValue) {
			this.moveList.push({
				key: key,
				from: fromValue,
				to: toValue,
				set: mtd.set
			});
		}
		return this;
	};

	Animation.prototype.moves = function(dom, json) {
		for(var key in json) {
			this.move(dom, key, json[key]);
		}
		return this;
	};

	Animation.prototype.movePolygon = function(dom, points) {
		var from = [];
		for(var i=0; i<dom.points.numberOfItems; i++) {
			var p = dom.points.getItem(i);
			this.move(p, "x", points[i].x);
			this.move(p, "y", points[i].y);
		}
	};

	Animation.prototype.show = function(dom, visible) {
		var mtd = getAttrSetter(dom);
		var disp = mtd.get("display");
		if(disp == null) {
			mtd.set("display", visible ? "block" : "none");
		} else if(disp == "none" && visible) {
			// fade in
			this.fadeInList.push(mtd.set);
			mtd.set("opacity", 0.0);
			mtd.set("display", "block");
		} else if(disp == "block" && !visible) {
			// fade out
			this.fadeOutList.push(mtd.set);
			mtd.set("opacity", 1.0);
			mtd.set("display", "block");
		}
		return this;
	};

	Animation.prototype.anime = function(r) {
		$.each(this.moveList, function(i, e) {
			e.set(e.key, e.from + (e.to - e.from) * r);
		});
		$.each(this.fadeInList, function(i, e) {
			e("opacity", r);
		});
		$.each(this.fadeOutList, function(i, e) {
			e("opacity", 1.0 - r);
		});
	};

	Animation.prototype.animeFinish = function() {
		$.each(this.moveList, function(i, e) {
			e.set(e.key, e.to);
		});
		$.each(this.fadeInList, function(i, e) {
			e("opacity", 1.0);
		});
		$.each(this.fadeOutList, function(i, e) {
			e("opacity", 1.0);
			e("display", "none");
		});
	};
	return Animation;
})();

