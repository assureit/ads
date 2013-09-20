var _this = this;
$(function () {
    function MakeSummary(case0) {
        var ret = {};

        ret.count = Object.keys(case0.ElementMap).length;
        return ret;
    }
    var matchResult = document.cookie.match(/userId=(\w+);?/);
    var userId = matchResult ? parseInt(matchResult[1]) : null;
    var isLoggedin = userId != null;
    var privateProjects = isLoggedin ? DCaseAPI.getProjectList().projectList : [];
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
            dcase.latestCommit.dateTime = (new Date(dcase.latestCommit.dateTime)).toString();
            var summary = {};
            if (dcase.latestCommit.summary) {
                summary = JSON.parse(dcase.latestCommit.summary);
            }
            dcase.latestCommit.summary = {};
            dcase.latestCommit.summary.count = summary.count ? summary.count : 0;
        }
    }
    $("#ProjectList").append($("#project_tmpl").tmpl(projects));

    $(".DeleteCaseButton").click(function () {
        var data = $(this).tmplItem().data;
        var caseId = data.dcaseId;
        var caseName = data.dcaseName;
        if (window.confirm('Are you sure to delete "' + caseName + '"?')) {
            if (DCaseAPI.deleteDCase(caseId) != null) {
                alert("Deleted.");
                location.reload();
            }
        }
    });

    $(".EditCaseButton").click(function () {
        var data = $(this).tmplItem().data;
        var caseId = data.dcaseId;
        var caseName = data.dcaseName;
        var msg = prompt('New name for "' + caseName + '":', caseName);
        if (msg != null) {
            if (DCaseAPI.editDCase(caseId, msg) != null) {
                data.dcaseName = msg;
                $($(this).tmplItem().nodes).find(".caseName").text(msg);
                alert("Renamed.");
            }
        }
    });

    var importFile = new ImportFile(".panel");
    importFile.read(function (file, target) {
        var x2dc = new Xml2DCaseTree.Converter();
        try  {
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
            var r = DCaseAPI.createDCase(file.name, encoded, projectId, MakeSummary(Case0));
            location.href = "./case/" + r.dcaseId;
        } catch (e) {
            console.log(e);
            alert("Your file format is currently not supported on Assure-It");
        }
    });
});
