$(function () {
    var idMatchResult = location.pathname.match(/new\/(\d+)/);
    var projectId = idMatchResult ? idMatchResult[1] - 0 : 0;
    var name = "";
    var description = "";

    var $inputDCaseName = $("#inputDCaseName");
    var $inputDesc = $("#inputDesc");

    $inputDCaseName.blur(function (e) {
        name = $inputDCaseName.val();
        $inputDCaseName.parent(".form-group").toggleClass("has-error", !name || name.trim().length == 0);
    });

    $inputDesc.blur(function (e) {
        description = $inputDesc.val();
        $inputDesc.parent(".form-group").toggleClass("has-error", !description || description.trim().length == 0);
    });

    $("#dcase-create").click(function (e) {
        e.preventDefault();
        var error = projectId == 0 || (!name || name.trim().length == 0) || (!description || description.trim().length == 0);
        if (error)
            return;
        var tree = "*Goal\n" + description;
        var r = DCaseAPI.createDCase(name, tree, projectId, { count: 1 });
        if (r && r.dcaseId) {
            location.href = "../case/" + r.dcaseId;
        } else {
            alert("ajax error");
        }
    });
});
