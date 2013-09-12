///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../types/jquery_plugins.d.ts'/>
///<reference path='adsComponentView.ts'/>
///<reference path='router.ts'/>
///<reference path='importfile.ts'/>
///<reference path='DCaseTree.ts'/>
///<reference path='Xml2DCaseTree.ts'/>

declare var AssureIt: any;
class ADS {
	TITLE_SUFFIX   : string = " - Assure-It";
	URL_EXPORT     : string = Config.BASEPATH + "/export";
	selectDCaseView: SelectDCaseView;
	createDCaseView: CreateDCaseView;

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

	initDefaultScreen(userId: number, pageIndex: number, selectDCaseView: SelectDCaseView) { //FIXME
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
		this.createDCaseView = new CreateDCaseView();

		var router = new Router();
		router.route("new/:project", "new", (project) => {
			var userId: number  = this.getLoginUserorNull();
			this.initDefaultScreen(userId, 1, null);
			$("#newDCase").show();
			$("#selectDCase").hide();

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

		var defaultRouter = (pageIndex: any) => {
			this.initDefaultScreen(this.getLoginUserorNull(), pageIndex, this.selectDCaseView);
			$("#newDCase").hide();
			$("#selectDCase").show();
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

		router.route("page/:id", "page", (pageIndex) => {
			defaultRouter(pageIndex);
		});

		router.route("", "", () => {
			defaultRouter(1);
		});


		router.start();

	} // function ADS

}
