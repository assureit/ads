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
