///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='dcaseviewer.ts'/>

class ColorSets {
	viewer: DCaseViewer;
	constructor(viewer:DCaseViewer) {
		this.viewer = viewer;
		$("#menu-change-theme *").remove();
	}

	Sets: any;

	add(theme) {
		//FIXME
	}

	get(name:string): any{
		return this.Sets[name];
	}


	init(): void{
		this.Sets = {
			"default":
				this.viewer.default_colorTheme,
			"Tiffanyblue":
				this.viewer.default_colorTheme,
			"simple":
				this.viewer.default_colorTheme,
		};
		this.Sets["Tiffanyblue"].fill = {
			"Goal": "#b4d8df",
			"Context": "#dbf5f3",
			"Subject": "#dbf5f3",
			"Strategy": "#b4d8df",
			"Evidence": "#dbf5f3",
			"Solution": "#dbf5f3",
			"Rebuttal": "#eeaaaa"
		};
		this.Sets["simple"].fill = {
			"Goal": "#ffffff",
			"Context": "#ffffff",
			"Subject": "#ffffff",
			"Strategy": "#ffffff",
			"Evidence": "#ffffff",
			"Solution": "#ffffff",
			"Rebuttal": "#ffffff"
		};
		this.Sets["simple"].stroke = {
			"Goal": "#000000",
			"Context": "#000000",
			"Subject": "#000000",
			"Strategy": "#000000",
			"Evidence": "#000000",
			"Solution": "#000000",
			"Rebuttal": "#000000"
		};
	};

	createDropMenu():void {
		var self = this;
		var $ul = $("#menu-change-theme");
		$.each(this.Sets, (name, theme) => {
			var sample = "";
			$.each(DCaseNode.TYPES, (i, type) => {
				sample += "<span style=\"color: " + theme.fill[type] + ";\">■</span>";
			});
			var $li = $("<li></li>")
				.html("<a href=\"#\">" + sample + name + "</a>")
				.appendTo($ul);
			$li.click(e => {
				self.viewer.setColorTheme(theme);
				e.preventDefault();
				document.cookie="colorTheme=" + name;
			});
		});
	}
}
