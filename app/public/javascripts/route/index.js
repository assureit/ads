var _this = this;
$(function () {
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
        }
    }
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

    var importFile = new ImportFile(".panel");
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
});
