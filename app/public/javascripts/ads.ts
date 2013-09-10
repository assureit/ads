///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../types/jquery_plugins.d.ts'/>
///<reference path='adsComponentView.ts'/>
///<reference path='router.ts'/>
///<reference path='color.ts'/>
///<reference path='importfile.ts'/>
///<reference path='dcaseviewer.ts'/>
///<reference path='timeline.ts'/>
///<reference path='dnode.ts'/>
///<reference path='DCaseTree.ts'/>
///<reference path='Xml2DCaseTree.ts'/>

declare var AssureIt: any;
class ADS {
	TITLE_SUFFIX   : string = " - Assure-It";
	URL_EXPORT     : string = Config.BASEPATH + "/export";
	viewer         : DCaseViewer;
	selectDCaseView: SelectDCaseView;
	tagListManager : TagListManager;
	createDCaseView: CreateDCaseView;
	timelineView   : TimeLineView;

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

	initDefaultScreen(userId: number, pageIndex: number, selectDCaseView: SelectDCaseView, tag?: string) { //FIXME
		var tags = [];
		if(tag != null) {
			tags.push(tag);
		}
		this.clearTimeLine();
		this.hideViewer();
		this.hideEditMenu();
		this.hideViewMenu();
		if(!this.isLogin(userId)) {
			$("#create-case-menu").css("display","none");
		}

		$("#dcase-manager").css("display", "block");

		if(selectDCaseView != null) {
			selectDCaseView.clear();
			selectDCaseView.addElements(userId);
		}
	}

	constructor(body: HTMLElement) {
		this.selectDCaseView = new SelectDCaseView();
		this.tagListManager  = new TagListManager();
		this.createDCaseView = new CreateDCaseView();

		var router = new Router();
		router.route("new/:project", "new", (project) => {
			var userId: number  = this.getLoginUserorNull();
			this.initDefaultScreen(userId, 1, null);
			$("#newDCase").show();
			$("#selectDCase").hide();
			$("#dcase-tags").hide();

			if(this.isLogin(userId)) {
				this.createDCaseView.enableSubmit(Number(project));
			} else {
				this.createDCaseView.disableSubmit();
			}
		});

		router.route("project/new", "project", () => {
			var page_moved = false;

			var idMatchResult = location.pathname.match(/(\d+)\/edit/);
			var projectId: number = idMatchResult ? <any>idMatchResult[1]-0 : 0;

			var addNewMember = function(){
				var newMemberForm = $("#member_tmpl").tmpl({name: "", role: ""});
				newMemberForm.find(".DeleteMemberButton").click(function(e){
					e.preventDefault();
					$($(this).tmplItem().nodes).remove();
					updateDeleteButtonState();
				});
				newMemberForm.find(".userName").blur(function(e){
					var name = this.value;
					var user = DCaseAPI.getUserByName(name);
					if(user && user.loginName == name && countNameInMember(name) == 1){
						$(this).addClass("disabled").attr("disabled", "");
						updateDeleteButtonState();
					}
				});
				$("#AddMemberButton").before(newMemberForm);
				return newMemberForm;
			}

			var countNameInMember = function(name: string){
				var list = getMemberList();
				var count = 0;
				for(var i = 0; i < list.length; i++){
					if(list[i][0] == name) count++;
				}
				return count;
			}

			var getMemberList = function(){
				var members = [];
				$(".memberForm").each((i, v) => {
					var name = $(v).find(".userName").attr("value").trim();
					var role = $(v).find(".role").attr("value").trim();
					if(name.length > 0){
						members.push([name, role]);
					}
				});
				return members;
			}

			var setMemberList = function(list: string[][]){
				for(var i = 0; i < list.length; i++){
					var newMemberForm = addNewMember();
					newMemberForm.find(".userName").attr("value", list[i][0]).addClass("disabled").attr("disabled", "");
					newMemberForm.find(".role").attr("value", list[i][1]);
				}
				updateDeleteButtonState();
			}

			var setProjectInfo = function(project: any){
				$("#inputProjectName").attr("value", project.name);
				//$("#inputLanguage").attr("value", project.);
				if(project.isPublic == 1){
					$("#inputIsPublic").attr("checked", "checked");
				}
			}

			var setMemberListVisible = function(isVisible: boolean){
				if(isVisible){
					$("#MemberList").show();
				}else{
					$("#MemberList").hide();
				}
			}

			var updateDeleteButtonState = function(){
				var validMemberCount = 0;
				$(".memberForm").each((i, v) => {
					if($(v).find(".userName").attr("disabled") != null){
						validMemberCount++;
					}else{
						$(v).find(".DeleteMemberButton").show();
					}
				});
				$(".memberForm").each((i, v) => {
					if($(v).find(".userName").attr("disabled") != null){
						if(validMemberCount > 1){
							$(v).find(".DeleteMemberButton").show();
						}else{
							$(v).find(".DeleteMemberButton").hide();
						}
					}
				});
			}

			$("#AddMemberButton").click((e)=>{
				e.preventDefault();
				addNewMember().find(".userName").focus();
			});

			$("#inputIsPublic").click((e)=>{
				setMemberListVisible($("#inputIsPublic").attr("checked") == null);
			});

			$("#project-create").click(function(e) {
				e.preventDefault();
				if(page_moved) return;
				page_moved = true;
				var name = $("#inputProjectName").attr("value");
				var isPublic = $("#inputIsPublic").attr("checked") != null;
				var language = $("#inputLanguage").attr("value");
				if(projectId){
					DCaseAPI.editProject(projectId, name, isPublic);
					DCaseAPI.updateProjectUser(projectId, getMemberList());
					location.href = "../../";
				}else{
					var r = DCaseAPI.createProject(name, isPublic).projectId;
					DCaseAPI.updateProjectUser(r, getMemberList());
					location.href = "../";
				}
			});


			$("#project-delete").click(function(e) {
				e.preventDefault();
				if(projectId){
					if(page_moved) return;
					page_moved = true;
					DCaseAPI.deleteProject(projectId);
					location.href = "../../";
				}
			});

			if(projectId){
				var project = DCaseAPI.getProject(projectId);
				var memberList = DCaseAPI.getProjectUserAndRole(projectId);
				setProjectInfo(project);
				setMemberList(memberList);
			}else{
				$("#inputIsPublic").attr("checked", "checked");
				var userName = $.cookie("userName");
				if(userName){
					setMemberList([[userName, ""]]);
				}
			}
			setMemberListVisible($("#inputIsPublic").attr("checked") == null);
		});

		var defaultRouter = (pageIndex: any, tag?: string) => {
			this.initDefaultScreen(this.getLoginUserorNull(), pageIndex, this.selectDCaseView, tag);
			$("#newDCase").hide();
			$("#selectDCase").show();
			$("#dcase-tags").show();
			var importFile = new ImportFile("article");
			importFile.read(function(file: DCaseFile, target: any) {
				var x2dc : Xml2DCaseTree.Converter = new Xml2DCaseTree.Converter();
				var tree : DCaseTree.TopGoalNode = x2dc.parseXml(file.result);
				var j = tree.convertAllChildNodeIntoJson([]);

				//FIXME convert from XML to ASN directly.
				var converter: any = new AssureIt.Converter();
				var encoder  : any = new AssureIt.CaseEncoder();
				var decoder  : any = new AssureIt.CaseDecoder();

				var s:any = {};
				s.contents = JSON.stringify({
					DCaseName: file.name,
					NodeCount: tree.NodeCount,
					TopGoalId: tree.TopGoalId,
					NodeList: j
				});

				var JsonData: any = converter.GenNewJson(s);
				var Case0: any = new AssureIt.Case(file.name, 0/*FIXME*/, 0/*FIXME*/, new AssureIt.PlugInManager("FIXME"));
				var root: any = decoder.ParseJson(Case0, JsonData);
				Case0.SetElementTop(root);
				var encoded: any = encoder.ConvertToASN(Case0.ElementTop, false);

				var projectId = parseInt($(target).attr("id").replace(/[a-zA-Z]*/,""));
				var r = DCaseAPI.createDCase(file.name, encoded, projectId);
				location.href = "./case/" + r.dcaseId;
			});
		}

		router.route("tag/:tag", "tag", (tag) => {
			defaultRouter(1,tag);
		});

		router.route("page/:id", "page", (pageIndex) => {
			defaultRouter(pageIndex);
		});

		router.route("", "", () => {
			defaultRouter(1);
		});

		router.route("dcase/:id", "dcase", (dcaseIdstr) => {
			var dcaseId = parseInt(dcaseIdstr);
			this.hideViewer();
			this.clearTimeLine();
			$("#newDCase").hide();
			$("#selectDCase").hide();
			$("#dcase-tags").hide();
			var userId = this.getLoginUserorNull();

			$(".ads-view-menu").css("display", "block");
			$(".ads-edit-menu").css("display", "block");

			$("#viewer").css("display", "block");
			var $body  = $(body);
			this.viewer = new DCaseViewer(document.getElementById("viewer"),
					null, this.isLogin(userId));
			this.timelineView = new TimeLineView($body, this.viewer, this.isLogin(userId));
			this.viewer.dcase_latest = null;

			$(window).bind("beforeunload", (e)=> {
				if(this.viewer.dcase_latest != null && this.viewer.dcase_latest.isChanged()) {
					return "未コミットの変更があります";
				}
			});
			var searchView = new SearchView(this.viewer);

			// show DCase
			var r:any = DCaseAPI.getDCase(dcaseId);
			var tree = <DCaseTreeRawData>JSON.parse(r.contents);
			var dcase = new DCaseModel(tree, dcaseId, r.commitId);
			this.viewer.setDCase(dcase);
			this.viewer.setDCaseName(r.dcaseName);
			this.timelineView.repaint(dcase);
			this.viewer.dcase_latest = dcase;
			document.title = r.dcaseName + this.TITLE_SUFFIX;
			$("#dcaseName").text(r.dcaseName);
			this.viewer.exportSubtree = (type, root) => {
				this.exportTree(type, root);
			};

		});

		router.start();

	} // function ADS

	commit(): void {
		if(this.viewer.editable) {
			if(!this.viewer.getDCase().isChanged()) {
				alert("変更されていません");
			} else {
				var msg = prompt("コミットメッセージを入力して下さい");
				if(msg != null) {
					var DCaseToBeCommit: DCaseModel = this.viewer.getDCase();
					if(DCaseToBeCommit.commit(msg)) {
						alert("コミットしました");
						var newCommitId = DCaseToBeCommit.commitId;
						var tree = DCaseAPI.getNodeTree(newCommitId);
						this.viewer.setDCase(new DCaseModel(tree, this.viewer.dcase.argId/*FIXME*/, newCommitId));
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
//		var shiftX = -rootview.offset.x - rootview.subtreeBounds.x;
//		var shiftY = -rootview.offset.y - rootview.subtreeBounds.y + rootview.nodeOffset;
		var $svg = $('<svg width="100%" height="100%" version="1.1" xmlns="'+SVG_NS+'">');
		$svg.append($("svg defs").clone(false));
		var $target = $(document.createElementNS(SVG_NS, "g"))
//			.attr("transform", "translate(" + shiftX + ", " + shiftY + ")")
			.appendTo($svg);

		var foreachLine = this.foreachLine;
		root.traverse((i, node) => {
			var nodeView = nodeViewMap[node.id];
			if(nodeView.visible == false) return;
			var svg  = nodeView.svgShape.$g;
			var div  = nodeView.$div[0];
			var arg  = nodeView.$argBorder;
			var undev= nodeView.$undevel;
			var connector = node != root ? nodeView.$line : null;
			
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
	}

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
		this.executePost(this.URL_EXPORT + '.' + type, {"type" : type, "svg" : svg});
	}

	exportViaJson(type, root): void {
		var json = {
				"contents": this.viewer.getDCase().encode()
		};
		json.contents.DCaseName = this.viewer.getDCaseName();
		this.executePost(this.URL_EXPORT + '.' + type, {"type" : type, "json" : JSON.stringify(json)});
	}

	exportTree(type: string, root: any): void {
		if(type == "png" || type == "pdf" || type == "svg") {
			this.exportViaSVG(type, root);
			return;
		} else {
			this.exportViaJson(type, root);
		}
		//var commitId = this.viewer.getDCase().commitId;
		//var url = this.URL_EXPORT + "?" + commitId + "." + type;
		//window.open(url, "_blank");
	}

	initDefaultEventListeners(): void {

		$("#ads-logo").click((e)=> {
			if($("#ads-logo").hasClass('navbar-hide')) {
				$(".navbar").removeClass('navbar-hide');
				//$("#viewer").removeClass('navbar-hide');
				$("#ads-logo").removeClass('navbar-hide');
			} else {
				$(".navbar").addClass('navbar-hide');
				//$("#viewer").addClass('navbar-hide');
				$("#ads-logo").addClass('navbar-hide');
			}
			e.preventDefault();
		});

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
			this.exportTree("json", null);
			e.preventDefault();
		});

		$("#menu-export-png").click((e)=> {
			this.exportTree("png", null);
			e.preventDefault();
		});

		$("#menu-export-pdf").click((e)=> {
			this.exportTree("pdf", null);
			e.preventDefault();
		});

		$("#menu-export-dscript").click((e)=> {
			this.exportTree("ds", null);
			e.preventDefault();
		});

		$("#menu-export-bash").click((e)=> {
			this.exportTree("sh", null);
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
