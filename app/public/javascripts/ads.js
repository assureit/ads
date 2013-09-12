var ADS = (function () {
    function ADS(body) {
        var _this = this;
        this.TITLE_SUFFIX = " - Assure-It";
        this.URL_EXPORT = Config.BASEPATH + "/export";
        this.selectDCaseView = new SelectDCaseView();
        this.createDCaseView = new CreateDCaseView();

        var router = new Router();
        router.route("new/:project", "new", function (project) {
            var userId = _this.getLoginUserorNull();
            _this.initDefaultScreen(userId, 1, null);
            $("#newDCase").show();
            $("#selectDCase").hide();

            if (_this.isLogin(userId)) {
                _this.createDCaseView.enableSubmit(Number(project));
            } else {
                _this.createDCaseView.disableSubmit();
            }
        });

        router.route("project/new", "project", function () {
            var page_moved = false;

            var idMatchResult = location.pathname.match(/(\d+)\/edit/);
            var projectId = idMatchResult ? idMatchResult[1] - 0 : 0;

            var addNewMember = function () {
                var newMemberForm = $("#member_tmpl").tmpl({ name: "", role: "" });
                newMemberForm.find(".DeleteMemberButton").click(function (e) {
                    e.preventDefault();
                    $($(this).tmplItem().nodes).remove();
                    updateDeleteButtonState();
                });
                newMemberForm.find(".userName").blur(function (e) {
                    var name = this.value;
                    var user = DCaseAPI.getUserByName(name);
                    if (user && user.loginName == name && countNameInMember(name) == 1) {
                        $(this).addClass("disabled").attr("disabled", "");
                        updateDeleteButtonState();
                    }
                });
                $("#AddMemberButton").before(newMemberForm);
                return newMemberForm;
            };

            var countNameInMember = function (name) {
                var list = getMemberList();
                var count = 0;
                for (var i = 0; i < list.length; i++) {
                    if (list[i][0] == name)
                        count++;
                }
                return count;
            };

            var getMemberList = function () {
                var members = [];
                $(".memberForm").each(function (i, v) {
                    var name = $(v).find(".userName").attr("value").trim();
                    var role = $(v).find(".role").attr("value").trim();
                    if (name.length > 0) {
                        members.push([name, role]);
                    }
                });
                return members;
            };

            var setMemberList = function (list) {
                for (var i = 0; i < list.length; i++) {
                    var newMemberForm = addNewMember();
                    newMemberForm.find(".userName").attr("value", list[i][0]).addClass("disabled").attr("disabled", "");
                    newMemberForm.find(".role").attr("value", list[i][1]);
                }
                updateDeleteButtonState();
            };

            var setProjectInfo = function (project) {
                $("#inputProjectName").attr("value", project.name);

                if (project.isPublic == 1) {
                    $("#inputIsPublic").attr("checked", "checked");
                }
            };

            var setMemberListVisible = function (isVisible) {
                if (isVisible) {
                    $("#MemberList").show();
                } else {
                    $("#MemberList").hide();
                }
            };

            var updateDeleteButtonState = function () {
                var validMemberCount = 0;
                $(".memberForm").each(function (i, v) {
                    if ($(v).find(".userName").attr("disabled") != null) {
                        validMemberCount++;
                    } else {
                        $(v).find(".DeleteMemberButton").show();
                    }
                });
                $(".memberForm").each(function (i, v) {
                    if ($(v).find(".userName").attr("disabled") != null) {
                        if (validMemberCount > 1) {
                            $(v).find(".DeleteMemberButton").show();
                        } else {
                            $(v).find(".DeleteMemberButton").hide();
                        }
                    }
                });
            };

            $("#AddMemberButton").click(function (e) {
                e.preventDefault();
                addNewMember().find(".userName").focus();
            });

            $("#inputIsPublic").click(function (e) {
                setMemberListVisible($("#inputIsPublic").attr("checked") == null);
            });

            $("#project-create").click(function (e) {
                e.preventDefault();
                if (page_moved)
                    return;
                page_moved = true;
                var name = $("#inputProjectName").attr("value");
                var isPublic = $("#inputIsPublic").attr("checked") != null;
                var language = $("#inputLanguage").attr("value");
                if (projectId) {
                    DCaseAPI.editProject(projectId, name, isPublic);
                    DCaseAPI.updateProjectUser(projectId, getMemberList());
                    location.href = "../../";
                } else {
                    var r = DCaseAPI.createProject(name, isPublic).projectId;
                    DCaseAPI.updateProjectUser(r, getMemberList());
                    location.href = "../";
                }
            });

            $("#project-delete").click(function (e) {
                e.preventDefault();
                if (projectId) {
                    if (page_moved)
                        return;
                    page_moved = true;
                    DCaseAPI.deleteProject(projectId);
                    location.href = "../../";
                }
            });

            if (projectId) {
                var project = DCaseAPI.getProject(projectId);
                var memberList = DCaseAPI.getProjectUserAndRole(projectId);
                setProjectInfo(project);
                setMemberList(memberList);
            } else {
                $("#inputIsPublic").attr("checked", "checked");
                var userName = $.cookie("userName");
                if (userName) {
                    setMemberList([[userName, ""]]);
                }
            }
            setMemberListVisible($("#inputIsPublic").attr("checked") == null);
        });

        var defaultRouter = function (pageIndex) {
            _this.initDefaultScreen(_this.getLoginUserorNull(), pageIndex, _this.selectDCaseView);
            $("#newDCase").hide();
            $("#selectDCase").show();
            var importFile = new ImportFile("article");
            importFile.read(function (file, target) {
                var x2dc = new Xml2DCaseTree.Converter();
                var tree = x2dc.parseXml(file.result);
                var j = tree.convertAllChildNodeIntoJson([]);

                var converter = new AssureIt.Converter();
                var encoder = new AssureIt.CaseEncoder();
                var decoder = new AssureIt.CaseDecoder();

                var s = {};
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
        };

        router.route("page/:id", "page", function (pageIndex) {
            defaultRouter(pageIndex);
        });

        router.route("", "", function () {
            defaultRouter(1);
        });

        router.start();
    }
    ADS.prototype.getLoginUserorNull = function () {
        var matchResult = document.cookie.match(/userId=(\w+);?/);
        var userId = matchResult ? parseInt(matchResult[1]) : null;
        if (userId == null) {
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

    ADS.prototype.initDefaultScreen = function (userId, pageIndex, selectDCaseView) {
        this.hideViewer();
        this.hideEditMenu();
        this.hideViewMenu();
        if (!this.isLogin(userId)) {
            $("#create-case-menu").css("display", "none");
        }

        $("#dcase-manager").css("display", "block");

        if (selectDCaseView != null) {
            selectDCaseView.clear();
            selectDCaseView.addElements(userId);
        }
    };
    return ADS;
})();
