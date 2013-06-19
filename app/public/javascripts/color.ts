///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='dcaseviewer.ts'/>

interface NodeSet {
	Goal: string;
	Context: string;
	Subject: string;
	Strategy: string;
	Evidence: string;
	Solution: string;
	Rebuttal: string;
	Monitor: string;
}

class DCaseTheme {
	selected: string;
	hovered: string;
	stroke: NodeSet;
	fill: NodeSet;
	constructor() {
		this.stroke = {
			"Goal"    : "none",
			"Context" : "none",
			"Subject" : "none",
			"Strategy": "none",
			"Evidence": "none",
			"Solution": "none",
			"Rebuttal": "none",
			"Monitor" : "none",
		};
		this.fill = {
			"Goal"    : "#E0E0E0",
			"Context" : "#C0C0C0",
			"Subject" : "#C0C0C0",
			"Strategy": "#B0B0B0",
			"Evidence": "#D0D0D0",
			"Solution": "#D0D0D0",
			"Rebuttal": "#EEAAAA",
			"Monitor" : "#D0D0D0",
		};
		this.selected = "#F08080";
		this.hovered = "#8080F0";
	}
}

class TiffanyblueTheme extends DCaseTheme {
	constructor () {
		super();
		this.fill = {
			"Goal": "#b4d8df",
			"Context": "#dbf5f3",
			"Subject": "#dbf5f3",
			"Strategy": "#b4d8df",
			"Evidence": "#dbf5f3",
			"Solution": "#dbf5f3",
			"Rebuttal": "#eeaaaa",
			"Monitor": "#dbf5f3",
		};
	}
}

class SimpleTheme extends DCaseTheme {
	constructor () {
		super();
		this.fill = {
			"Goal": "#ffffff",
			"Context": "#ffffff",
			"Subject": "#ffffff",
			"Strategy": "#ffffff",
			"Evidence": "#ffffff",
			"Solution": "#ffffff",
			"Rebuttal": "#ffffff",
			"Monitor": "#ffffff"
		};
		this.stroke = {
			"Goal": "#000000",
			"Context": "#000000",
			"Subject": "#000000",
			"Strategy": "#000000",
			"Evidence": "#000000",
			"Solution": "#000000",
			"Rebuttal": "#000000",
			"Monitor": "#000000"
		};
	}
}

class ColorSets {
	colorTheme: DCaseTheme;
	ThemeSets: any;
	constructor(public viewer: DCaseViewer) {
		this.ThemeSets = {
			"default"    : new DCaseTheme(),
			"Tiffanyblue": new TiffanyblueTheme(),
			"simple"     : new SimpleTheme(),
		}
		this.colorTheme = this.ThemeSets.default;
		$("#menu-change-theme *").remove();
	}

	add(theme) {
		//FIXME
	}

	get(name:string): any{
		return this.ThemeSets[name];
	}

	createDropMenu():void {
		var $ul = $("#menu-change-theme");
		$.each(this.ThemeSets, (name, theme) => {
			var sample = "";
			$.each(DCaseNodeModel.TYPES, (i, type) => {
				sample += "<span style=\"color: " + theme.fill[type] + ";\">■</span>";
			});
			var $li = $("<li></li>")
				.html("<a href=\"#\">" + sample + name + "</a>")
				.appendTo($ul);
			$li.click((e) => {
				this.viewer.setColorTheme(theme);
				e.preventDefault();
				document.cookie="colorTheme=" + name;
			});
		});
	}
}
