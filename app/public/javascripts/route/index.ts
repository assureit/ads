///<reference path='../../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../Xml2DCaseTree.ts'/>
///<reference path='../DCaseTree.ts'/>

//TODO resolve dupulicate library
//<reference path='../../assurejs/src/CaseEncoder.ts'/>
//<reference path='../../assurejs/src/Converter.ts'/>
//<reference path='../../assurejs/src/CaseDecoder.ts'/>
//<reference path='../../assurejs/src/CaseModel.ts'/>
//<reference path='../../assurejs/src/PlugInManager.ts'/>

declare module AssureIt {
	export class Converter {
		GenNewJson(s:any):any;
	}
	export class CaseEncoder {
		ConvertToASN(a:any, b:any):any;
	}
	export class CaseDecoder {
		ParseJson(Case:Case, s:any):any;
	}
	export class Case {
		constructor(name:string, a:number, b:number, PlugInManager: PlugInManager);
		SetElementTop(root:any);
		ElementTop: any;
	}
	export class PlugInManager {
		constructor(path: string);
	}
}
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

	var importFile = new ImportFile(".panel");
	importFile.read((file, target)=> {
		var x2dc = new Xml2DCaseTree.Converter();
		var tree = x2dc.parseXml(file.result);
		var j = tree.convertAllChildNodeIntoJson([]);

		var converter = new AssureIt.Converter();
		var encoder = new AssureIt.CaseEncoder();
		var decoder = new AssureIt.CaseDecoder();

		var s:any = {};
		s.contents = JSON.stringify({
			DCaseName: file.name,
			NodeCount: tree.NodeCount,
			TopGoalId: tree.TopGoalId,
			NodeList: j
		});

		var JsonData = converter.GenNewJson(s);
		var Case0 = new AssureIt.Case(file.name, 0, 0, new AssureIt.PlugInManager("FIXME"));
		var root = decoder.ParseJson(Case0, JsonData);
		Case0.SetElementTop(root);
		var encoded = encoder.ConvertToASN(Case0.ElementTop, false);
		var projectId = parseInt($(target).attr("id").replace(/[a-zA-Z]*/, ""));
		var r = DCaseAPI.createDCase(file.name, encoded, projectId);
		location.href = "./case/" + r.dcaseId;
	});

});
