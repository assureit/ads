///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../DefinitelyTyped/bootstrap/bootstrap.d.ts'/>
///<reference path='api.ts'/>

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
			location.href = "./#dcase/" + r.dcaseId;
		});
	}

	enableSubmit(userId): void{
		$("#dcase-create").removeClass("disabled");
		$("#inputDCaseName").removeAttr("disabled");
		$("#inputDesc").removeAttr("disabled");
	};

	disableSubmit(): void{
		$("#dcase-create").addClass("disabled");
		$("#inputDCaseName").attr("disabled", "");
		$("#inputDesc").attr("disabled", "");
	};
}

class SelectDCaseView {
	pageIndex: number;
	maxPageSize: number;

	constructor() {
		this.pageIndex = 1;
		this.maxPageSize = 2;
	}

	clearTable(): void{
		$("tbody#dcase-select-table *").remove();
	}

	addTable(userId, pageIndex): void{
		if(pageIndex == null || pageIndex < 1) pageIndex = 1;
		this.pageIndex = pageIndex - 0;
		var $tbody = $("#dcase-select-table");
		var searchResults: any = DCaseAPI.searchDCase(this.pageIndex);
		var dcaseList : any = searchResults.dcaseList;
		this.maxPageSize  = searchResults.summary.maxPage;
		if(dcaseList.length == 0) {
			$("<tr><td><font color=gray>DCaseがありません</font></td><td></td><td></td><td></td></tr>")
			.appendTo($tbody);
		}
		$.each(dcaseList, (i, dcase) => {
			var id = dcase.dcaseId;
			var name = dcase.dcaseName;
			var user = dcase.userName;
			var lastDate: any = dcase.latestCommit.dateTime;//new DateFormatter(dcase.latestCommit.time).format();
			var lastUser: any = dcase.latestCommit.userName;
			var html = "<td><a href=\"#dcase/" + id + "\">" + name +
					"</a></td><td>" + user + "</td><td>" + lastDate + "</td><td>" +
					lastUser + "</td>";
			if(userId != null) {
				html += "<td><a id=\"e"+ id +"\" href=\"#\">Edit</a></td>"
					+ "<td><a id=\"d"+ id +"\" href=\"#\">Delete</a></td>";
			}
			$("<tr></tr>")
				.html(html)
				.appendTo($tbody);
			if(userId != null) {
				$("a#e"+id).click(function(){
					var msg = prompt("dcase名を入力して下さい");
					if(msg != null) {
						if(DCaseAPI.editDCase(id, msg) != null) {
							alert("変更しました");
							location.reload();
						}
					}
				});
				$("a#d"+id).click(function(){
					if(window.confirm('dcaseを削除しますか?')) {
						if(DCaseAPI.deleteDCase(id) != null) {
							alert("削除しました");
							location.reload();
						}
					}
				});
			}
		});
	}

	initEvents() {
		var self = this;
		$("#prev-page").click(e => {
			var i = self.pageIndex - 0;
			if(i > 1) {
				self.pageIndex = i - 1;
				location.href = "./#page/" + self.pageIndex;
			}
			e.preventDefault();
		});

		$("#next-page").click(e => {
			var i = self.pageIndex - 0;
			if(self.maxPageSize >= i + 1) {
				self.pageIndex = i + 1;
				location.href = "./#page/" + self.pageIndex;
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
		root.traverse(function(node) {
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
					.html("<a href=\"#dcase/" + id + "\">" + id + "</a>")
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
