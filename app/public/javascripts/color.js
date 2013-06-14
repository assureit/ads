var ColorSets = (function () {
	function ColorSets(viewer) {
		this.viewer = viewer;
		$("#menu-change-theme *").remove();
	}

	ColorSets.prototype.addTheme = function(theme) {
		//FIXME
	}

	ColorSets.prototype.changeTheme = function(name) {
		return this.colorThemes[name];
	}

	ColorSets.prototype.initDefaultTheme = function() {
		this.colorThemes = {
			"default":
				this.viewer.default_colorTheme,
			"TiffanyBlue": {
				fill: {
					"Goal"    : "#b4d8df",
					"Context" : "#dbf5f3",
					"Subject" : "#dbf5f3",
					"Strategy": "#b4d8df",
					"Evidence": "#dbf5f3",
					"Solution": "#dbf5f3",
					"Rebuttal": "#eeaaaa",
				},
				__proto__: this.viewer.default_colorTheme
			},
			"simple": {
				fill: {
					"Goal"    : "#ffffff",
					"Context" : "#ffffff",
					"Subject" : "#ffffff",
					"Strategy": "#ffffff",
					"Evidence": "#ffffff",
					"Solution": "#ffffff",
					"Rebuttal": "#ffffff",
				},
				stroke: {
					"Goal"    : "#000000",
					"Context" : "#000000",
					"Subject" : "#000000",
					"Strategy": "#000000",
					"Evidence": "#000000",
					"Solution": "#000000",
					"Rebuttal": "#000000",
				},
				__proto__: this.viewer.default_colorTheme
			},
		};
	};

	ColorSets.prototype.createDropMenu = function() {
		var self = this;
		var $ul = $("#menu-change-theme");
		$.each(this.colorThemes, function(name, theme) {
			var sample = "";
			$.each(DCaseNode.TYPES, function(i, type) {
				sample += "<span style=\"color: " + theme.fill[type] + ";\">■</span>";
			});
			var $li = $("<li></li>")
				.html("<a href=\"#\">" + sample + name + "</a>")
				.appendTo($ul);
			$li.click(function(e) {
				self.viewer.setColorTheme(theme);
				e.preventDefault();
				document.cookie="colorTheme=" + name;
			});
		});
	}

	return ColorSets;
})();
