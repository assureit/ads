var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CreateDCaseView = (function () {
    function CreateDCaseView() {
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
            var id = 1;
            var tree = {
                NodeList: [
                    {
                        ThisNodeId: id,
                        NodeType: "Goal",
                        Description: desc,
                        Children: []
                    }
                ],
                TopGoalId: id,
                NodeCount: 1
            };
            var r = DCaseAPI.createDCase(name, tree);
            location.href = "./dcase/" + r.dcaseId;
        });
    }
    CreateDCaseView.prototype.enableSubmit = function () {
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

var SelectDCaseContent = (function () {
    function SelectDCaseContent(id, name, user, lastDate, lastUser, isLogin) {
        this.id = id;
        this.name = name;
        this.user = user;
        this.lastDate = lastDate;
        this.lastUser = lastUser;
        this.isLogin = isLogin;
    }
    SelectDCaseContent.prototype.toHtml = function (callback) {
        return callback(this.id, this.name, this.user, this.lastDate, this.lastUser, this.isLogin);
    };

    SelectDCaseContent.prototype.setEvent = function () {
        var _this = this;
        if (this.isLogin) {
            $("a#e" + this.id).click(function (e) {
                var msg = prompt("dcase名を入力して下さい");
                if (msg != null) {
                    if (DCaseAPI.editDCase(_this.id, msg) != null) {
                        alert("変更しました");
                        location.reload();
                    }
                }
            });
            $("a#d" + this.id).click(function (e) {
                if (window.confirm('dcaseを削除しますか?')) {
                    if (DCaseAPI.deleteDCase(_this.id) != null) {
                        alert("削除しました");
                        location.reload();
                    }
                }
            });
        }
    };
    return SelectDCaseContent;
})();

var SelectDCaseManager = (function () {
    function SelectDCaseManager() {
        this.contents = [];
    }
    SelectDCaseManager.prototype.clear = function () {
    };
    SelectDCaseManager.prototype.updateContentsOrZeroView = function () {
    };

    SelectDCaseManager.prototype.add = function (s) {
        this.contents.push(s);
    };

    SelectDCaseManager.prototype._updateContentsOrZeroView = function ($tbody, zeroStr, callback) {
        if (this.contents.length == 0) {
            $(zeroStr).appendTo($tbody);
        }
        $.each(this.contents, function (i, s) {
            s.toHtml(callback).appendTo($tbody);
            s.setEvent();
        });
    };
    return SelectDCaseManager;
})();

var ThumnailView = (function () {
    function ThumnailView() {
    }
    ThumnailView.toThumnail = function (id, name, user, lastDate, lastUser, isLogin) {
        var html = '<ul class="thumbnails"><li class="span4"><a href="#" class="thumbnail">' + name + '</a></li></ul>';
        return $('<div></div>').html(html);
    };
    return ThumnailView;
})();

var SelectDCaseThumbnailManager = (function (_super) {
    __extends(SelectDCaseThumbnailManager, _super);
    function SelectDCaseThumbnailManager() {
        _super.call(this);
    }
    SelectDCaseThumbnailManager.prototype.clear = function () {
        $("#selectDCase *").remove();
        $("#selectDCase").append('<div class="row-fluid"></div>');
    };

    SelectDCaseThumbnailManager.prototype.updateContentsOrZeroView = function () {
        _super.prototype._updateContentsOrZeroView.call(this, $('#selectDCase .row-fluid'), "<font color=gray>DCaseがありません</font>", ThumnailView.toThumnail);
    };
    return SelectDCaseThumbnailManager;
})(SelectDCaseManager);

var TableView = (function () {
    function TableView() {
    }
    TableView.toTable = function (id, name, user, lastDate, lastUser, isLogin) {
        var html = '<td><a href="' + Config.BASEPATH + '/dcase/' + id + '">' + name + "</a></td><td>" + user + "</td><td>" + lastDate + "</td><td>" + lastUser + "</td>";
        if (isLogin) {
            html += "<td><a id=\"e" + id + "\" href=\"#\">Edit</a></td>" + "<td><a id=\"d" + id + "\" href=\"#\">Delete</a></td>";
        }
        return $("<tr></tr>").html(html);
    };
    return TableView;
})();

var SelectDCaseTableManager = (function (_super) {
    __extends(SelectDCaseTableManager, _super);
    function SelectDCaseTableManager() {
        _super.call(this);
    }
    SelectDCaseTableManager.prototype.clear = function () {
        $("tbody#dcase-select-table *").remove();
    };

    SelectDCaseTableManager.prototype.updateContentsOrZeroView = function () {
        _super.prototype._updateContentsOrZeroView.call(this, $('#dcase-select-table'), "<tr><td><font color=gray>DCaseがありません</font></td><td></td><td></td><td></td></tr>", TableView.toTable);
    };
    return SelectDCaseTableManager;
})(SelectDCaseManager);

var SelectDCaseView = (function () {
    function SelectDCaseView() {
        this.pageIndex = 1;
        this.maxPageSize = 2;
        this.manager = new SelectDCaseTableManager();
    }
    SelectDCaseView.prototype.clear = function () {
        this.manager.clear();
    };

    SelectDCaseView.prototype.addElements = function (userId, pageIndex, tags) {
        var _this = this;
        if (pageIndex == null || pageIndex < 1)
            pageIndex = 1;
        if (tags == null)
            tags = [];
        this.pageIndex = pageIndex - 0;
        var searchResults = DCaseAPI.searchDCase(this.pageIndex, tags);
        var dcaseList = searchResults.dcaseList;
        this.maxPageSize = searchResults.summary.maxPage;

        var isLogin = userId != null;
        $.each(dcaseList, function (i, dcase) {
            var s = new SelectDCaseContent(dcase.dcaseId, dcase.dcaseName, dcase.userName, dcase.latestCommit.dateTime, dcase.latestCommit.userName, isLogin);
            _this.manager.add(s);
        });
        this.manager.updateContentsOrZeroView();
    };

    SelectDCaseView.prototype.initEvents = function () {
        var _this = this;
        $("#prev-page").click(function (e) {
            var i = _this.pageIndex - 0;
            if (i > 1) {
                _this.pageIndex = i - 1;
                location.href = Config.BASEPATH + "/page/" + _this.pageIndex;
            }
            e.preventDefault();
        });

        $("#next-page").click(function (e) {
            var i = _this.pageIndex - 0;
            if (_this.maxPageSize >= i + 1) {
                _this.pageIndex = i + 1;
                location.href = Config.BASEPATH + "/page/" + _this.pageIndex;
            }
            e.preventDefault();
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
