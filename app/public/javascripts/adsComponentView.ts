///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../DefinitelyTyped/bootstrap/bootstrap.d.ts'/>
///<reference path='api.ts'/>
///<reference path='dcaseviewer.ts'/>

class CreateDCaseView {
	projectid: number;
	constructor() {
		var self = this;
		this.projectid = -1;
		$("#dcase-create").click(function() {
			var name = $("#inputDCaseName").attr("value");
			var desc = $("#inputDesc").attr("value");
			var error = false;
			if(name == "") {
				$("#newdcase-name").addClass("error");
				error = true;
			} else {
				$("#newdcase-name").removeClass("error");
			}
			if(desc == "") {
				$("#newdcase-desc").addClass("error");
				error = true;
			}
			if(error) return;
			var tree = "*Goal\n" + desc;
			var r: any = DCaseAPI.createDCase(name, tree, self.projectid);
			location.href = "../case/" + r.dcaseId;
		});
	}

	enableSubmit(projectid: number): void{
		this.projectid = projectid;
		$("#dcase-create").removeClass("disabled");
		$("#inputDCaseName").removeAttr("disabled");
		$("#inputDesc").removeAttr("disabled");
	}

	disableSubmit(): void{
		$("#dcase-create").addClass("disabled");
		$("#inputDCaseName").attr("disabled", "");
		$("#inputDesc").attr("disabled", "");
	}
}

class SelectDCaseView {

	constructor() {
	}

	clear(): void {
		$("#ProjectList *").remove();
	}

	addElements(userId): void {
		var isLoggedin = userId != null;
		var privateProjects: any = isLoggedin ? DCaseAPI.getProjectList(userId).projectList : [];
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
			}
		}
		console.log(projects);
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
	}
}

class SearchView {

	constructor(public viewer: DCaseViewer) {
		var searchQuery = $('#search-query');
		searchQuery.popover({
			html: true,
			placement: 'bottom',
			trigger: 'manual',
			content: function(){
				var wrapper = $('<div id="search_result_wrapper">');
				$('<a class="btn btn-link">close</a>').click(function(){
					searchQuery.popover('hide');
					return false;
				}).appendTo(wrapper);
				wrapper.append('<ul id="search_result_ul" class="unstyled">');
				wrapper.width(searchQuery.width());
				return wrapper;
			},
		});
		$('#search-form').submit(()=>{
			var query = searchQuery.val();
			if(query.length > 0){
				this.updateSearchResult(query);
			}
			return false;
		});
	}

	searchNode(text, types, beginDate, endDate, callback, callbackOnNoResult): void {
		var dcase = this.viewer.getDCase();
		var root = dcase ? dcase.getTopGoal() : undefined;
		if(!root) {
			if(callbackOnNoResult) {
				callbackOnNoResult();
			}
			return;
		}
		root.traverse((index, node) => {
			var name = node.name;
			var desc = node.desc;
			var d_index = desc.toLowerCase().indexOf(text);
			var n_index = name.toLowerCase().indexOf(text);
			if(d_index != -1 || n_index != -1) {
				callback(node);
				//var ptext = getPreviewText(desc, text);
				//callback($res, v, name, ptext);
			}
		});
	}

	updateSearchResult(text) {
		$('#search-query').popover('show');
		var $res = $("#search_result_ul");
		$res.empty();
		text = text.toLowerCase();
		var result = DCaseAPI.searchDCase(text);
		if(result.length == 0) {
			$res.append("<li>No Results</li>");
		} else {
			for(var i = 0; i < result.length; ++i) {
				var res = result[i];
				var id = res.dcaseId;
				$("<li>")
					.html("<a href=\"dcase/" + id + "\">" + id + "</a>")
					.appendTo($res);
			}
		}
		$res.append("<hr>");
		this.searchNode(text, [], null, null, (node) => {
			$("<li>")
				.html("<a href=\"#\">" + node.name + "</a>")
				.click((e) => {
					this.viewer.centerize(node, 500);
					e.preventDefault();
				})
				.appendTo($res);
		}, ()=>{});
	}
}

class TagListModel {
	tagList: string[];
	constructor() {
		this.tagList = DCaseAPI.getTagList().tagList;
	}

	addTag(tag: string) {
		this.tagList.push(tag);
	}

	getList(): string[] {
		return this.tagList;
	}
}

class TagListView {
	constructor(public selecter: string, public model:TagListModel) {
		this.clear();
		this.update();
	}

	clear(): void {
		$(this.selecter + ' *').remove();
		$(this.selecter).append('<li><a href="'+Config.BASEPATH+'/#" id="alltags">All</a></li><li class="line"></li>');
	}

	update() {
		var tagList: string[] = this.model.getList();
		console.log(tagList.length);
		for(var i:number = 0;i < tagList.length; i++) {
			$(this.selecter).prepend('<li><a href="'+Config.BASEPATH+'/tag/'+tagList[i]+'" >'+tagList[i]+'</a></li>');
		}
	}
}

class TagListManager {
	view:  TagListView;
	model: TagListModel;

	constructor() {
		this.model = new TagListModel();
		this.view = new TagListView('#dcase-tags-ul', this.model);
	}

}
