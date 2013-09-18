///<reference path='../../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../../types/jquery_plugins.d.ts'/>
///<reference path='../api.ts'/>

$(()=>{
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
