///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='adsComponentView.ts'/>
///<reference path='router.ts'/>
///<reference path='color.ts'/>
///<reference path='importfile.ts'/>
///<reference path='dcaseviewer.ts'/>

class ADS {
	TITLE_SUFFIX:   string = " - Assurance DS";
	URL_EXPORT:     string = "cgi/view2.cgi"; //FIXME
	URL_EXPORT_SVG: string = "cgi/svg.cgi";
	viewer: DCaseViewer;
	selectDCaseView: SelectDCaseView;
	createDCaseView: CreateDCaseView;
	timelineView   : TimeLineView;
	dcase_latest   : any;


	getLoginUserorNull() {
		var matchResult = document.cookie.match(/userId=(\w+);?/);
		var userId = matchResult ? parseInt(matchResult[1]) : null;
		if(userId == null) { //FIXME
			// disable edit menu when non-login
			this.hideEditMenu();
		}
		return userId;
	}

	isLogin(id: number) {
		return id != null;
	}

	hideEditMenu() {
		$(".ads-edit-menu").css("display", "none");
	}

	hideViewMenu() {
		$(".ads-view-menu").css("display", "none");
	}

	hideViewer() {
		$("#viewer").hide();//.css("display", "none");
		$("#viewer *").remove();//.css("display", "none");
	}

	clearTimeLine() {
		if($(".timeline").length > 0) {
			$(".timeline").remove();
		}
	}

	initDefaultScreen(userId: number, pageIndex: number, selectDCaseView: SelectDCaseView) { //FIXME
		this.clearTimeLine();
		this.hideViewer();
		this.hideEditMenu();
		this.hideViewMenu();

		$("#dcase-manager").css("display", "block");

		if(selectDCaseView != null) {
			selectDCaseView.clearTable();
			selectDCaseView.addTable(userId, pageIndex);
		}
	}

	constructor(body: HTMLElement) {
		this.selectDCaseView = new SelectDCaseView();
		this.selectDCaseView.initEvents();
		this.createDCaseView = new CreateDCaseView();

		var router = new Router();
		router.route("new", "new", function() {
			var userId: number  = this.getLoginUserorNull();
			this.initDefaultScreen(userId);
			$("#newDCase").show();
			$("#selectDCase").hide();

			if(this.isLogin(userId)) {
				this.createDCaseView.enableSubmit();
			} else {
				this.createDCaseView.disableSubmit();
			}
		});

		var defaultRouter = (pageIndex: any) => {
			this.initDefaultScreen(this.getLoginUserorNull(), pageIndex, this.selectDCaseView);
			$("#newDCase").hide();
			$("#selectDCase").show();
			var importFile = new ImportFile();
			importFile.read((file) => {
				var tree = JSON.parse(file.result); //TODO convert to Markdown
				if("contents" in tree) {
					var r = DCaseAPI.createDCase(file.name.split(".")[0], tree.contents);
					location.href = "./#dcase/" + r.dcaseId;
				} else {
					alert("Invalid File");
				}
			});
		}

		router.route("page/:id", "page", (pageIndex) => {
			defaultRouter(pageIndex);
		});

		router.route("", "", () => {
			defaultRouter(1);
		});

		router.route("dcase/:id", "dcase", (dcaseId) => {
			this.hideViewer();
			this.clearTimeLine();
			$("#newDCase").hide();
			$("#selectDCase").hide();
			var userId = this.getLoginUserorNull();

			$(".ads-view-menu").css("display", "block");
			$(".ads-edit-menu").css("display", "block");

			$("#viewer").css("display", "block");
			var $body  = $(body);
			var viewer = new DCaseViewer(document.getElementById("viewer"),
					null, this.isLogin(userId));
			this.timelineView = new TimeLineView($body, viewer, this.isLogin(userId));
			this.dcase_latest = null;

			$(window).bind("beforeunload", (e)=> {
				if(this.dcase_latest != null && this.dcase_latest.isChanged()) {
					return "未コミットの変更があります";
				}
			});
			var searchView = new SearchView();

			var colorSets = new ColorSets(viewer);
			colorSets.init();
			colorSets.createDropMenu();
			// change color theme
			var name = document.cookie.match(/colorTheme=(\w+);?/);
			if(name != null) {
				this.viewer.setColorTheme(colorSets.get(name[1]));
			}

			// show DCase
			var r:any = DCaseAPI.getDCase(dcaseId);
			var dcase = new DCase(JSON.parse(r.contents), dcaseId, r.commitId);
			viewer.setDCase(dcase);
			this.timelineView.repaint(dcase);
			this.dcase_latest = dcase;
			document.title = r.dcaseName + this.TITLE_SUFFIX;
			$("#dcaseName").text(r.dcaseName);

		});

		router.start();

		this.viewer.exportSubtree = (type, root) => {
			this.exportTree(type, root);
		};
	} // function ADS

	commit(): void {
		if(this.viewer.editable) {
			if(!this.viewer.getDCase().isChanged()) {
				alert("変更されていません");
			} else {
				var msg = prompt("コミットメッセージを入力して下さい");
				if(msg != null) {
					if(this.viewer.getDCase().commit(msg)) {
						alert("コミットしました");
						this.timelineView.repaint(this.viewer.getDCase());
					}
				}
			}
		}
	}

	foreachLine(str: string, max: number, callback) : void{
		if(!callback) return;
		var rest: string = str;
		var maxLength: number = max || 20;
		maxLength = maxLength < 1 ? 1 : maxLength;
		var length = 0;
		var i = 0;
		for(var pos = 0; pos < rest.length; ++pos) {
			var code = rest.charCodeAt(pos);
			length += code < 128 ? 1 : 2;
			if(length > maxLength || rest.charAt(pos) == "\n"){
				callback(rest.substr(0, pos), i);
				if(rest.charAt(pos) == "\n"){
					pos++;
				}
				rest = rest.substr(pos, rest.length - pos);
				pos = -1;
				length = 0;
				i++;
			}
		}
		callback(rest, i);
	}

	splitTextByLength(str: string, max: number) : any[] {
		var arr = [];
		this.foreachLine(str, max, (s) => { arr.push(s); });
		return arr;
	}

	createSVGDocument(viewer: DCaseViewer, root: any): any {
		var nodeViewMap = viewer.nodeViewMap;
		var dcase = viewer.getDCase();
		if(root == null) {
			root = viewer.getDCase().getTopGoal();
		}
		if(!root) {
			return;
		}

		var rootview = nodeViewMap[root.id];
		var shiftX = -rootview.bounds.x - rootview.subtreeBounds.x;
		var shiftY = -rootview.bounds.y - rootview.subtreeBounds.y + rootview.nodeOffset;
		var $svg = $('<svg width="100%" height="100%" version="1.1" xmlns="'+SVG_NS+'">');
		$svg.append($("svg defs").clone(false));
		var $target = $(document.createElementNS(SVG_NS, "g"))
			.attr("transform", "translate(" + shiftX + ", " + shiftY + ")")
			.appendTo($svg);

		var foreachLine = this.foreachLine;
		root.traverse((node) => {
			var nodeView = nodeViewMap[node.id];
			if(nodeView.visible == false) return;
			var svg  = nodeView.svg[0];
			var div  = nodeView.$div[0];
			var arg  = nodeView.argumentBorder;
			var undev= nodeView.svgUndevel;
			var connector = node != root ? nodeView.line : null;
			
			jQuery.each([arg, connector, undev], function(i, v){
				if(v) $target.append($(v).clone(false));
			});
			$target.append($(svg).clone(false));

			var $svgtext = $(document.createElementNS(SVG_NS, "text"))
				.attr({x : div.offsetLeft, y : div.offsetTop + 10});
			
			$(document.createElementNS(SVG_NS, "tspan"))
				.text(node.name).attr("font-weight", "bold").appendTo($svgtext);

			foreachLine(node.desc, 1+~~(div.offsetWidth * 2 / 13), (linetext) => {
				$(document.createElementNS(SVG_NS, "tspan"))
					.text(linetext)
					.attr({x : div.offsetLeft, dy : 15, "font-size" : "13px"})
					.appendTo($svgtext);
			});

			$target.append($svgtext);
		});

		var $dummydiv = $("<div>").append($svg);
		var header = '<?xml version="1.0" standalone="no"?>\n' + 
			'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
		var doc = header + $dummydiv.html();
		$svg.empty().remove();
		return doc;
	};

	executePost(action, data): void {
		var $body = $(document.body);
		var $form = $("<form>").attr({
			"action" : action,
			"method" : "post",
			"target" : "_blank",
		}).hide().appendTo($body);
		
		if (data !== undefined) {
			for (var paramName in data) {
				$('<input type="hidden">').attr({
					'name' : paramName,
					'value' : data[paramName],
				}).appendTo($form);
			}
		}
		$form.submit();
		$form.empty().remove();
	}

	exportViaSVG(type, root): void {
		var svg = this.createSVGDocument(this.viewer, root);
		svg = svg.replace("</svg></svg>", "</svg>"); // for IE10 Bug
		this.executePost(this.URL_EXPORT_SVG, {"type" : type, "svg" : svg});
	}

	exportTree(type: string, root: any): void {
		if(type == "png" || type == "pdf" || type == "svg"){
			this.exportViaSVG(type, root);
			return;
		}
		var commitId = this.viewer.getDCase().commitId;
		var url = this.URL_EXPORT + "?" + commitId + "." + type;
		window.open(url, "_blank");
	};

	initDefaultEventListeners(): void {
		$("#menu-commit").click((e)=> {
			this.commit();
			e.preventDefault();
		});

		$("#menu-undo").click((e)=> {
			this.viewer.getDCase().undo();
			e.preventDefault();
		});

		$("#menu-redo").click((e)=> {
			this.viewer.getDCase().redo();
			e.preventDefault();
		});

		$("#menu-export-json").click((e)=> {
			this.exportTree("json");
			e.preventDefault();
		});

		$("#menu-export-png").click((e)=> {
			this.exportTree("png");
			e.preventDefault();
		});

		$("#menu-export-pdf").click((e)=> {
			this.exportTree("pdf");
			e.preventDefault();
		});

		$("#menu-export-dscript").click((e)=> {
			this.exportTree("dscript");
			e.preventDefault();
		});

		$("#lang-select-english").click((e)=> {
			document.cookie = "lang=en";
			e.preventDefault();
			location.reload(true);
		});

		$("#lang-select-japanese").click((e)=> {
			document.cookie = "lang=ja";
			e.preventDefault();
			location.reload(true);
		});

	}
}
