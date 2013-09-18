///<reference path='../../../DefinitelyTyped/jquery/jquery.d.ts'/>

/*
$(()=>{
	var ads: ADS = new ADS(document.getElementById("ase"));

	var sidemenu = new SideMenu();

	var $id: JQuery    = $('#signup-userid');
	var $pass1: JQuery = $('#signup-pass');
	var $pass2: JQuery = $('#signup-pass2');

	function verify(): void{
		if($id.val().length > 0 && $pass1.val().length > 0 && $pass1.val() == $pass2.val()){
			$('#sign-up-form .btn').removeAttr("disabled");
		} else {
			$('#sign-up-form .btn').attr("disabled", "disabled");
		}
	};
	$id.keyup(verify);
	$pass1.keyup(verify);
	$pass2.keyup(verify);
});
*/
$(()=>{
	var matchResult = document.cookie.match(/userId=(\w+);?/);
	var userId = matchResult ? parseInt(matchResult[1]) : null;
	var isLoggedin = userId != null;
	var privateProjects: any = isLoggedin ? DCaseAPI.getProjectList().projectList : [];
	var publicProjects: any = DCaseAPI.getPublicProjectList().projectList;
	var projects = privateProjects.concat(publicProjects);
	for(var i = 0; i < privateProjects.length; i++){
		privateProjects[i].isPrivate = true;
	}
	for(var i = 0; i < projects.length; i++){
		var project = projects[i];
		project.users = project.isPrivate ? DCaseAPI.getProjectUser(project.projectId).userList : [];
		project.cases = DCaseAPI.getProjectDCase(1, project.projectId).dcaseList;
		for(var j = 0; j < project.cases.length; j++){
			var dcase = project.cases[j];
			dcase.dateTime = TimeUtil.formatDate(dcase.latestCommit.dateTime);
			dcase.latestCommit.dateTime = (new Date(dcase.latestCommit.dateTime)).toString();
		}
	}
	$("#ProjectList").append( (<any>$)("#project_tmpl").tmpl(projects) );

	$(".DeleteCaseButton").click(function(){
		var dcaseId = (<any>($(this))).tmplItem().data.dcaseId;
		if(window.confirm('dcaseを削除しますか?')) {
			if(DCaseAPI.deleteDCase(dcaseId) != null) {
				alert("削除しました");
				location.reload();
			}
		}
	});
});
