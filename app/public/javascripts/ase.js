var ASE = function(body) {
	var self = this;
	var TITLE_SUFFIX = " - AssuranceScriptEditor";

	//--------------------------------------------------------

	function getURLParameter(name) {
		return decodeURI(
			(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
		);
	}
	var dcaseId = parseInt(getURLParameter("dcaseId"));
	if(isNaN(dcaseId)) dcaseId = 0;

	var matchResult = document.cookie.match(/userId=(\w+);?/);
	var userId = matchResult ? parseInt(matchResult[1]) : null;

	if(userId == null) {
		// disable edit menu when non-login
		$(".ase-edit-menu").css("display", "none");
	}
	if(dcaseId == 0) {
		// disable view/edit menu when non-selected dcase
		$(".ase-edit-menu").css("display", "none");
		$(".ase-view-menu").css("display", "none");
	} else {
		$(".ase-view-menu").css("display", "block");
	}

	if(dcaseId == 0) {
		$("#dcase-manager").css("display", "block");

		if(userId != null) {
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
				var r = DCaseAPI.createDCase(name, tree, userId);
				location.href = "./?dcaseId=" + r.dcaseId;
			});
		} else {
			$("#dcase-create").addClass("disabled");
			$("#inputDCaseName").attr("disabled", "");
			$("#inputDesc").attr("disabled", "");
		}

		var $tbody = $("#dcase-select-table");
		var dcaseList = DCaseAPI.getDCaseList();
		if(dcaseList.length == 0) {
			$("<tr><td><font color=gray>DCaseがありません</font></td><td></td><td></td><td></td></tr>")
			.appendTo($tbody);
		}
		$.each(dcaseList, function(i, dcase) {
			var id = dcase.dcaseId;
			var name = dcase.dcaseName;
			var user = dcase.userName;
			var lastDate = new DateFormatter(dcase.latestCommit.time).format();
			var lastUser = dcase.latestCommit.userName;
			var html = "<td><a href=\"./?dcaseId=" + id + "\">" + name + 
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
						if(DCaseAPI.renameDCase(id, msg) != null) {
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
		return;
	}

	$("#viewer").css("display", "block");
	var $body = this.$body = $(body);
	var viewer = this.viewer = new DCaseViewer(document.getElementById("viewer"),
			null, userId != null);
	var timeline = this.timeline = new TimeLine($body);
	var dcase_latest = null;

	//--------------------------------------------------------

	$("#menu-history-toggle").click(function() {
		timeline.visible();
	});

	timeline.onDCaseSelected = function(dcaseId, commitId, isLatest) {
		var dcase = viewer.getDCase();
		if(dcase != null && dcase.isChanged()) {
			dcase_latest = dcase;
		}
		viewer.editable = isLatest && userId != null;//FIXME
		if(isLatest && dcase_latest != null) {
			viewer.setDCase(dcase_latest);
		} else {
			var tree = DCaseAPI.getNodeTree(commitId);
			viewer.setDCase(new DCase(tree, dcaseId, commitId));
		}
		return true;
	};

	//--------------------------------------------------------

	this.commit = function() {
		if(viewer.editable) {
			if(!viewer.getDCase().isChanged()) {
				alert("変更されていません");
			} else {
				var msg = prompt("コミットメッセージを入力して下さい");
				if(msg != null) {
					if(viewer.getDCase().commit(msg, userId)) {
						alert("コミットしました");
						timeline.repaint(viewer.getDCase());
					}
				}
			}
		}
	};

	$(window).bind("beforeunload", function(e) {
		if(dcase_latest != null && dcase_latest.isChanged()) {
			return "未コミットの変更があります";
		}
	});

	//--------------------------------------------------------

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
	$('#search-form').submit(function(){
		var query = searchQuery.val();
		if(query.length > 0){
			self.updateSearchResult(query);
		}
		return false;
	});

	this.searchNode = function(text, types, beginDate, endDate, callback, callbackOnNoResult) {
		var dcase = viewer.getDCase();
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
	};

	this.updateSearchResult = function(text) {
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
					.html("<a href=\"./?dcaseId=" + id + "\">" + id + "</a>")
					.appendTo($res);
			}
		}
		$res.append("<hr>");
		self.searchNode(text, [], null, null, function(node) {
			$("<li>")
				.html("<a href=\"#\">" + node.name + "</a>")
				.click(function() {
					viewer.centerize(node, 500);
				})
				.appendTo($res);
		});
	};

	//--------------------------------------------------------

	var URL_EXPORT = "cgi/view2.cgi";
	var URL_EXPORT_SVG = "cgi/svg.cgi";

	this.foreachLine = function(str, max, callback){
		if(!callback) return;
		var rest = str;
		var maxLength = max || 20;
		maxLength = maxLength < 1 ? 1 : maxLength;
		var length = 0;
		var i = 0;
		for(var pos = 0; pos < rest.length; ++pos){
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
	};
	
	this.splitTextByLength = function(str, max){
		var arr = [];
		foreachLine(str, max, function(s){ arr.push(s); });
		return arr;
	}

	this.createSVGDocument = function(viewer, root) {
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
		root.traverse(function(node) {
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

			foreachLine(node.desc, 1+~~(div.offsetWidth * 2 / 13), function(linetext) {
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

	this.executePost = function(action, data) {
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
	
	this.exportViaSVG = function(type, root) {
		var svg = this.createSVGDocument(self.viewer, root);
		svg = svg.replace("</svg></svg>", "</svg>"); // for IE10 Bug
		this.executePost(URL_EXPORT_SVG, {"type" : type, "svg" : svg});
	}

	this.exportTree = function(type, root) {
		if(type == "png" || type == "pdf" || type == "svg"){
			this.exportViaSVG(type, root);
			return;
		}
		var commitId = viewer.getDCase().commitId;
		var url = URL_EXPORT + "?" + commitId + "." + type;
		window.open(url, "_blank");
	};

	this.viewer.exportSubtree = function(type, root) {
		self.exportTree(type, root);
	};

	//--------------------------------------------------------

	$("#menu-commit").click(function() {
		self.commit();
	});

	$("#menu-undo").click(function() {
		viewer.getDCase().undo();
	});

	$("#menu-redo").click(function() {
		viewer.getDCase().redo();
	});

	$("#menu-export-json").click(function() {
		self.exportTree("json");
	});

	$("#menu-export-png").click(function() {
		self.exportTree("png");
	});

	$("#menu-export-pdf").click(function() {
		self.exportTree("pdf");
	});

	$("#menu-export-dscript").click(function() {
		self.exportTree("dscript");
	});

	$("#lang-select-english").click(function() {
		document.cookie = "lang=en";
		location.reload(true);
	});

	$("#lang-select-japanese").click(function() {
		document.cookie = "lang=ja";
		location.reload(true);
	});

	//--------------------------------------------------------

	var colorThemes = {
		"default": 
			viewer.default_colorTheme,
		"TiffanyBlue": {
			fill: {
				"Goal"    : "#b4d8df",
				"Context" : "#dbf5f3",
				"Subject" : "#dbf5f3",
				"Strategy": "#b4d8df",
				"Evidence": "#dbf5f3",
				"Solution": "#dbf5f3",
				"Rebuttal": "#eeaaaa",
			},
			__proto__: viewer.default_colorTheme
		},
		"simple": {
			fill: {
				"Goal"    : "#ffffff",
				"Context" : "#ffffff",
				"Subject" : "#ffffff",
				"Strategy": "#ffffff",
				"Evidence": "#ffffff",
				"Solution": "#ffffff",
				"Rebuttal": "#ffffff",
			},
			stroke: {
				"Goal"    : "#000000",
				"Context" : "#000000",
				"Subject" : "#000000",
				"Strategy": "#000000",
				"Evidence": "#000000",
				"Solution": "#000000",
				"Rebuttal": "#000000",
			},
			__proto__: viewer.default_colorTheme
		},
	};

	//--------------------------------------------------------

	(function() {
		// update color theme menu
		var $ul = $("#menu-change-theme");
		$.each(colorThemes, function(name, theme) {
			var sample = "";
			$.each(DCaseNode.TYPES, function(i, type) {
				sample += "<span style=\"color: " + theme.fill[type] + ";\">■</span>";
			});
			var $li = $("<li></li>")
				.html("<a href=\"#\">" + sample + name + "</a>")
				.appendTo($ul);
			$li.click(function() {
				viewer.setColorTheme(theme);
				document.cookie="colorTheme=" + name;
			});
		});

		// show DCase
		var r = DCaseAPI.getDCase(dcaseId);
		var dcase = new DCase(r.tree, dcaseId, r.commitId);
		viewer.setDCase(dcase);
		timeline.repaint(dcase);
		dcase_latest = dcase;
		document.title = r.dcaseName + TITLE_SUFFIX;
		$("#dcaseName").text(r.dcaseName);

		// change color theme
		var name = document.cookie.match(/colorTheme=(\w+);?/);
		if(name != null) {
			viewer.setColorTheme(colorThemes[name[1]]);
		}
	}());

};

