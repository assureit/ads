var ADS = (function () {
    function ADS(body) {
        var _this = this;
        this.TITLE_SUFFIX = " - Assurance DS";
        this.URL_EXPORT = Config.BASEPATH + "/export";
        this.selectDCaseView = new SelectDCaseView();
        this.selectDCaseView.initEvents();
        this.createDCaseView = new CreateDCaseView();
        var router = new Router();
        router.route("new", "new", function () {
            var userId = _this.getLoginUserorNull();
            _this.initDefaultScreen(userId, 1, null);
            $("#newDCase").show();
            $("#selectDCase").hide();
            if(_this.isLogin(userId)) {
                _this.createDCaseView.enableSubmit();
            } else {
                _this.createDCaseView.disableSubmit();
            }
        });
        var defaultRouter = function (pageIndex) {
            _this.initDefaultScreen(_this.getLoginUserorNull(), pageIndex, _this.selectDCaseView);
            $("#newDCase").hide();
            $("#selectDCase").show();
            var importFile = new ImportFile("#ase");
            importFile.read(function (file) {
                var tree = JSON.parse(file.result);
                if("contents" in tree) {
                    var r = DCaseAPI.createDCase(tree.contents.DCaseName, tree.contents);
                    location.href = "./dcase/" + r.dcaseId;
                } else {
                    alert("Invalid File");
                }
            });
        };
        router.route("page/:id", "page", function (pageIndex) {
            defaultRouter(pageIndex);
        });
        router.route("", "", function () {
            defaultRouter(1);
        });
        router.route("dcase/:id", "dcase", function (dcaseIdstr) {
            var dcaseId = parseInt(dcaseIdstr);
            _this.hideViewer();
            _this.clearTimeLine();
            $("#newDCase").hide();
            $("#selectDCase").hide();
            var userId = _this.getLoginUserorNull();
            $(".ads-view-menu").css("display", "block");
            $(".ads-edit-menu").css("display", "block");
            $("#viewer").css("display", "block");
            var $body = $(body);
            _this.viewer = new DCaseViewer(document.getElementById("viewer"), null, _this.isLogin(userId));
            _this.timelineView = new TimeLineView($body, _this.viewer, _this.isLogin(userId));
            _this.viewer.dcase_latest = null;
            $(window).bind("beforeunload", function (e) {
                if(_this.viewer.dcase_latest != null && _this.viewer.dcase_latest.isChanged()) {
                    return "未コミットの変更があります";
                }
            });
            var searchView = new SearchView(_this.viewer);
            var r = DCaseAPI.getDCase(dcaseId);
            var tree = JSON.parse(r.contents);
            var dcase = new DCaseModel(tree, dcaseId, r.commitId);
            _this.viewer.setDCase(dcase);
            _this.viewer.setDCaseName(r.dcaseName);
            _this.timelineView.repaint(dcase);
            _this.viewer.dcase_latest = dcase;
            document.title = r.dcaseName + _this.TITLE_SUFFIX;
            $("#dcaseName").text(r.dcaseName);
            _this.viewer.exportSubtree = function (type, root) {
                _this.exportTree(type, root);
            };
        });
        router.start();
    }
    ADS.prototype.getLoginUserorNull = function () {
        var matchResult = document.cookie.match(/userId=(\w+);?/);
        var userId = matchResult ? parseInt(matchResult[1]) : null;
        if(userId == null) {
            this.hideEditMenu();
        }
        return userId;
    };
    ADS.prototype.isLogin = function (id) {
        return id != null;
    };
    ADS.prototype.hideEditMenu = function () {
        $(".ads-edit-menu").css("display", "none");
    };
    ADS.prototype.hideViewMenu = function () {
        $(".ads-view-menu").css("display", "none");
    };
    ADS.prototype.hideViewer = function () {
        $("#viewer").hide();
        $("#viewer *").remove();
    };
    ADS.prototype.clearTimeLine = function () {
        if($(".timeline").length > 0) {
            $(".timeline").remove();
        }
    };
    ADS.prototype.initDefaultScreen = function (userId, pageIndex, selectDCaseView) {
        this.clearTimeLine();
        this.hideViewer();
        this.hideEditMenu();
        this.hideViewMenu();
        $("#dcase-manager").css("display", "block");
        if(selectDCaseView != null) {
            selectDCaseView.clearTable();
            selectDCaseView.addTable(userId, pageIndex);
        }
    };
    ADS.prototype.commit = function () {
        if(this.viewer.editable) {
            if(!this.viewer.getDCase().isChanged()) {
                alert("変更されていません");
            } else {
                var msg = prompt("コミットメッセージを入力して下さい");
                if(msg != null) {
                    var DCaseToBeCommit = this.viewer.getDCase();
                    if(DCaseToBeCommit.commit(msg)) {
                        alert("コミットしました");
                        var newCommitId = DCaseToBeCommit.commitId;
                        var tree = DCaseAPI.getNodeTree(newCommitId);
                        this.viewer.setDCase(new DCaseModel(tree, tree.dcaseId, newCommitId));
                        this.timelineView.repaint(this.viewer.getDCase());
                    }
                }
            }
        }
    };
    ADS.prototype.foreachLine = function (str, max, callback) {
        if(!callback) {
            return;
        }
        var rest = str;
        var maxLength = max || 20;
        maxLength = maxLength < 1 ? 1 : maxLength;
        var length = 0;
        var i = 0;
        for(var pos = 0; pos < rest.length; ++pos) {
            var code = rest.charCodeAt(pos);
            length += code < 128 ? 1 : 2;
            if(length > maxLength || rest.charAt(pos) == "\n") {
                callback(rest.substr(0, pos), i);
                if(rest.charAt(pos) == "\n") {
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
    ADS.prototype.splitTextByLength = function (str, max) {
        var arr = [];
        this.foreachLine(str, max, function (s) {
            arr.push(s);
        });
        return arr;
    };
    ADS.prototype.createSVGDocument = function (viewer, root) {
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
        var $svg = $('<svg width="100%" height="100%" version="1.1" xmlns="' + SVG_NS + '">');
        $svg.append($("svg defs").clone(false));
        var $target = $(document.createElementNS(SVG_NS, "g")).attr("transform", "translate(" + shiftX + ", " + shiftY + ")").appendTo($svg);
        var foreachLine = this.foreachLine;
        root.traverse(function (i, node) {
            var nodeView = nodeViewMap[node.id];
            if(nodeView.visible == false) {
                return;
            }
            var svg = nodeView.svg[0];
            var div = nodeView.$div[0];
            var arg = nodeView.argumentBorder;
            var undev = nodeView.svgUndevel;
            var connector = node != root ? nodeView.line : null;
            jQuery.each([
                arg, 
                connector, 
                undev
            ], function (i, v) {
                if(v) {
                    $target.append($(v).clone(false));
                }
            });
            $target.append($(svg).clone(false));
            var $svgtext = $(document.createElementNS(SVG_NS, "text")).attr({
                x: div.offsetLeft,
                y: div.offsetTop + 10
            });
            $(document.createElementNS(SVG_NS, "tspan")).text(node.name).attr("font-weight", "bold").appendTo($svgtext);
            foreachLine(node.desc, 1 + ~~(div.offsetWidth * 2 / 13), function (linetext) {
                $(document.createElementNS(SVG_NS, "tspan")).text(linetext).attr({
                    x: div.offsetLeft,
                    dy: 15,
                    "font-size": "13px"
                }).appendTo($svgtext);
            });
            $target.append($svgtext);
        });
        var $dummydiv = $("<div>").append($svg);
        var header = '<?xml version="1.0" standalone="no"?>\n' + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
        var doc = header + $dummydiv.html();
        $svg.empty().remove();
        return doc;
    };
    ADS.prototype.executePost = function (action, data) {
        var $body = $(document.body);
        var $form = $("<form>").attr({
            "action": action,
            "method": "post",
            "target": "_blank"
        }).hide().appendTo($body);
        if(data !== undefined) {
            for(var paramName in data) {
                $('<input type="hidden">').attr({
                    'name': paramName,
                    'value': data[paramName]
                }).appendTo($form);
            }
        }
        $form.submit();
        $form.empty().remove();
    };
    ADS.prototype.exportViaSVG = function (type, root) {
        var svg = this.createSVGDocument(this.viewer, root);
        svg = svg.replace("</svg></svg>", "</svg>");
        this.executePost(this.URL_EXPORT + '.' + type, {
            "type": type,
            "svg": svg
        });
    };
    ADS.prototype.exportViaJson = function (type, root) {
        var json = {
            "contents": this.viewer.getDCase().encode()
        };
        json.contents.DCaseName = this.viewer.getDCaseName();
        this.executePost(this.URL_EXPORT + '.' + type, {
            "type": type,
            "json": JSON.stringify(json)
        });
    };
    ADS.prototype.exportTree = function (type, root) {
        if(type == "png" || type == "pdf" || type == "svg") {
            this.exportViaSVG(type, root);
            return;
        } else {
            this.exportViaJson(type, root);
        }
    };
    ADS.prototype.initDefaultEventListeners = function () {
        var _this = this;
        $("#menu-commit").click(function (e) {
            _this.commit();
            e.preventDefault();
        });
        $("#menu-undo").click(function (e) {
            _this.viewer.getDCase().undo();
            e.preventDefault();
        });
        $("#menu-redo").click(function (e) {
            _this.viewer.getDCase().redo();
            e.preventDefault();
        });
        $("#menu-export-json").click(function (e) {
            _this.exportTree("json", null);
            e.preventDefault();
        });
        $("#menu-export-png").click(function (e) {
            _this.exportTree("png", null);
            e.preventDefault();
        });
        $("#menu-export-pdf").click(function (e) {
            _this.exportTree("pdf", null);
            e.preventDefault();
        });
        $("#menu-export-dscript").click(function (e) {
            _this.exportTree("dscript", null);
            e.preventDefault();
        });
        $("#lang-select-english").click(function (e) {
            document.cookie = "lang=en";
            e.preventDefault();
            location.reload(true);
        });
        $("#lang-select-japanese").click(function (e) {
            document.cookie = "lang=ja";
            e.preventDefault();
            location.reload(true);
        });
    };
    return ADS;
})();
