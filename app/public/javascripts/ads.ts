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
