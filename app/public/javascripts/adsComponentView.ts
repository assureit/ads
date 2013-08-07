///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../DefinitelyTyped/bootstrap/bootstrap.d.ts'/>
///<reference path='api.ts'/>
///<reference path='dcaseviewer.ts'/>

class CreateDCaseView {
	constructor() {
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
			var id = 1;
			var tree = {
				NodeList: [{
					ThisNodeId: id,
					NodeType: "Goal",
					Description: desc,
					Children: [],
				}],
				TopGoalId: id,
				NodeCount: 1,
			};
			var r: any = DCaseAPI.createDCase(name, tree);
			location.href = "./dcase/" + r.dcaseId;
		});
	}

	enableSubmit(): void{
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

class SelectDCaseContent {
	constructor(public id: number, public name: string, public user: string, public lastDate: any, public lastUser: any, public isLogin: bool) {
	}

	toHtml(callback: (id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool) => JQuery) : JQuery {
		return callback(this.id, this.name, this.user, this.lastDate, this.lastUser, this.isLogin);
	}

	setEvent() : void {
		if(this.isLogin) {
			$("a#e"+this.id).click((e)=>{
				var msg = prompt("dcase名を入力して下さい");
				if(msg != null) {
					if(DCaseAPI.editDCase(this.id, msg) != null) {
						alert("変更しました");
						location.reload();
					}
				}
			});
			$("a#d"+this.id).click((e)=>{
				if(window.confirm('dcaseを削除しますか?')) {
					if(DCaseAPI.deleteDCase(this.id) != null) {
						alert("削除しました");
						location.reload();
					}
				}
			});
		}
	}
}

class SelectDCaseManager {
	contents: SelectDCaseContent[] = [];
	
	constructor() {}
	clear() : void {}
	updateContentsOrZeroView():void {}

	add(s: SelectDCaseContent): void {
		this.contents.push(s);
	}

	_updateContentsOrZeroView($tbody: JQuery, zeroStr: string, callback: (id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool) => JQuery):void {
		if(this.contents.length == 0) {
			$(zeroStr).appendTo($tbody);
		}
		$.each(this.contents, (i, s) => {
			s.toHtml(callback).appendTo($tbody);
			s.setEvent();
		});
	}
}

class ThumnailView {
	static toThumnail(id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool): JQuery {
		var html = '<ul class="thumbnails"><li class="span4"><a href="#" class="thumbnail">'+name+'</a></li></ul>';
		return $('<div></div>').html(html);
	}
}

class SelectDCaseThumbnailManager extends SelectDCaseManager{
	constructor() {
		super();
	}

	clear() : void {
		$("#selectDCase *").remove();
		$("#selectDCase").append('<div class="row-fluid"></div>');
	}

	updateContentsOrZeroView():void {
		super._updateContentsOrZeroView($('#selectDCase .row-fluid'), "<font color=gray>DCaseがありません</font>", ThumnailView.toThumnail);
	}
}

class TableView {
	static toTable(id: number, name: string, user: string, lastDate: any, lastUser: any, isLogin: bool): JQuery {
		var html = '<td><a href="' + Config.BASEPATH + '/case/' + id + '">' + name +
				"</a></td><td>" + user + "</td><td>" + lastDate + "</td><td>" +
				lastUser + "</td>";
		if(isLogin) {
			html += "<td><a id=\"e"+ id +"\" href=\"#\">Edit</a></td>"
				+ "<td><a id=\"d"+ id +"\" href=\"#\">Delete</a></td>";
		}
		return $("<tr></tr>").html(html);
	}
}

class SelectDCaseTableManager extends SelectDCaseManager{
	constructor() {
		super();
	}

	clear() : void {
		$("tbody#dcase-select-table *").remove();
	}

	updateContentsOrZeroView():void {
		super._updateContentsOrZeroView($('#dcase-select-table'), "<tr><td><font color=gray>DCaseがありません</font></td><td></td><td></td><td></td></tr>", TableView.toTable);
	}
}

class SelectDCaseView {
	pageIndex: number;
	maxPageSize: number;
	manager: SelectDCaseManager;

	constructor() {
		this.pageIndex = 1;
		this.maxPageSize = 2;
		this.manager = new SelectDCaseTableManager();
	}

	clear(): void {
		this.manager.clear();
	}

	addElements(userId, pageIndex?: any, tags?: string[]): void {
		if(pageIndex == null || pageIndex < 1) pageIndex = 1;
		if(tags == null) tags = [];
		this.pageIndex = pageIndex - 0;
		var searchResults: any = DCaseAPI.searchDCase(this.pageIndex, tags);
		var dcaseList : any = searchResults.dcaseList;
		this.maxPageSize  = searchResults.summary.maxPage;

		var isLogin = userId != null;
		$.each(dcaseList, (i, dcase)=>{
			var s:SelectDCaseContent = new SelectDCaseContent(dcase.dcaseId, dcase.dcaseName, dcase.userName, dcase.latestCommit.dateTime, dcase.latestCommit.userName, isLogin);
			this.manager.add(s);
		});
		this.manager.updateContentsOrZeroView();
	}

	initEvents() {
		$("#prev-page").click((e) => {
			var i = this.pageIndex - 0;
			if(i > 1) {
				this.pageIndex = i - 1;
				location.href = Config.BASEPATH + "/page/" + this.pageIndex;
			}
			e.preventDefault();
		});

		$("#next-page").click((e) => {
			var i = this.pageIndex - 0;
			if(this.maxPageSize >= i + 1) {
				this.pageIndex = i + 1;
				location.href = Config.BASEPATH + "/page/" + this.pageIndex;
			}
			e.preventDefault();
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
