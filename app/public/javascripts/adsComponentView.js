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
    };
    return SelectDCaseView;
})();
