var CreateDCaseView = (function () {
    function CreateDCaseView() {
        var self = this;
        this.projectid = -1;
        $("#dcase-create").click(function () {
            var name = $("#inputDCaseName").attr("value");
            var desc = $("#inputDesc").attr("value");
            var error = false;
            if (name == "") {
                $("#newdcase-name").addClass("error");
                error = true;
            } else {
                $("#newdcase-name").removeClass("error");
            }
            if (desc == "") {
                $("#newdcase-desc").addClass("error");
                error = true;
            }
            if (error)
                return;
            var tree = "*Goal\n" + desc;
            var r = DCaseAPI.createDCase(name, tree, self.projectid);
            location.href = "../case/" + r.dcaseId;
        });
    }
    CreateDCaseView.prototype.enableSubmit = function (projectid) {
        this.projectid = projectid;
        $("#dcase-create").removeClass("disabled");
        $("#inputDCaseName").removeAttr("disabled");
        $("#inputDesc").removeAttr("disabled");
    };

    CreateDCaseView.prototype.disableSubmit = function () {
        $("#dcase-create").addClass("disabled");
        $("#inputDCaseName").attr("disabled", "");
        $("#inputDesc").attr("disabled", "");
    };
    return CreateDCaseView;
})();

var SelectDCaseView = (function () {
    function SelectDCaseView() {
    }
    SelectDCaseView.prototype.clear = function () {
        $("#ProjectList *").remove();
    };

    SelectDCaseView.prototype.addElements = function (userId) {
        var isLoggedin = userId != null;
        var privateProjects = isLoggedin ? DCaseAPI.getProjectList(userId).projectList : [];
        var publicProjects = DCaseAPI.getPublicProjectList().projectList;
        var projects = privateProjects.concat(publicProjects);
        for (var i = 0; i < privateProjects.length; i++) {
            privateProjects[i].isPrivate = true;
        }
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            project.users = project.isPrivate ? DCaseAPI.getProjectUser(project.projectId).userList : [];
            project.cases = DCaseAPI.getProjectDCase(1, project.projectId).dcaseList;
            for (var j = 0; j < project.cases.length; j++) {
                var dcase = project.cases[j];
                dcase.dateTime = TimeUtil.formatDate(dcase.latestCommit.dateTime);
            }
        }
        console.log(projects);
        $("#ProjectList").append(($)("#project_tmpl").tmpl(projects));

        $(".DeleteCaseButton").click(function () {
            var dcaseId = (($(this))).tmplItem().data.dcaseId;
            if (window.confirm('dcaseを削除しますか?')) {
                if (DCaseAPI.deleteDCase(dcaseId) != null) {
                    alert("削除しました");
                    location.reload();
                }
            }
        });
    };
    return SelectDCaseView;
})();

var SearchView = (function () {
    function SearchView(viewer) {
        var _this = this;
        this.viewer = viewer;
        var searchQuery = $('#search-query');
        searchQuery.popover({
            html: true,
            placement: 'bottom',
            trigger: 'manual',
            content: function () {
                var wrapper = $('<div id="search_result_wrapper">');
                $('<a class="btn btn-link">close</a>').click(function () {
                    searchQuery.popover('hide');
                    return false;
                }).appendTo(wrapper);
                wrapper.append('<ul id="search_result_ul" class="unstyled">');
                wrapper.width(searchQuery.width());
                return wrapper;
            }
        });
        $('#search-form').submit(function () {
            var query = searchQuery.val();
            if (query.length > 0) {
                _this.updateSearchResult(query);
            }
            return false;
        });
    }
    SearchView.prototype.searchNode = function (text, types, beginDate, endDate, callback, callbackOnNoResult) {
        var dcase = this.viewer.getDCase();
        var root = dcase ? dcase.getTopGoal() : undefined;
        if (!root) {
            if (callbackOnNoResult) {
                callbackOnNoResult();
            }
            return;
        }
        root.traverse(function (index, node) {
            var name = node.name;
            var desc = node.desc;
            var d_index = desc.toLowerCase().indexOf(text);
            var n_index = name.toLowerCase().indexOf(text);
            if (d_index != -1 || n_index != -1) {
                callback(node);
            }
        });
    };

    SearchView.prototype.updateSearchResult = function (text) {
        var _this = this;
        $('#search-query').popover('show');
        var $res = $("#search_result_ul");
        $res.empty();
        text = text.toLowerCase();
        var result = DCaseAPI.searchDCase(text);
        if (result.length == 0) {
            $res.append("<li>No Results</li>");
        } else {
            for (var i = 0; i < result.length; ++i) {
                var res = result[i];
                var id = res.dcaseId;
                $("<li>").html("<a href=\"dcase/" + id + "\">" + id + "</a>").appendTo($res);
            }
        }
        $res.append("<hr>");
        this.searchNode(text, [], null, null, function (node) {
            $("<li>").html("<a href=\"#\">" + node.name + "</a>").click(function (e) {
                _this.viewer.centerize(node, 500);
                e.preventDefault();
            }).appendTo($res);
        }, function () {
        });
    };
    return SearchView;
})();

var TagListModel = (function () {
    function TagListModel() {
        this.tagList = DCaseAPI.getTagList().tagList;
    }
    TagListModel.prototype.addTag = function (tag) {
        this.tagList.push(tag);
    };

    TagListModel.prototype.getList = function () {
        return this.tagList;
    };
    return TagListModel;
})();

var TagListView = (function () {
    function TagListView(selecter, model) {
        this.selecter = selecter;
        this.model = model;
        this.clear();
        this.update();
    }
    TagListView.prototype.clear = function () {
        $(this.selecter + ' *').remove();
        $(this.selecter).append('<li><a href="' + Config.BASEPATH + '/#" id="alltags">All</a></li><li class="line"></li>');
    };

    TagListView.prototype.update = function () {
        var tagList = this.model.getList();
        console.log(tagList.length);
        for (var i = 0; i < tagList.length; i++) {
            $(this.selecter).prepend('<li><a href="' + Config.BASEPATH + '/tag/' + tagList[i] + '" >' + tagList[i] + '</a></li>');
        }
    };
    return TagListView;
})();

var TagListManager = (function () {
    function TagListManager() {
        this.model = new TagListModel();
        this.view = new TagListView('#dcase-tags-ul', this.model);
    }
    return TagListManager;
})();
