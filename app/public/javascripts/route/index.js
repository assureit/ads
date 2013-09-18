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
});
