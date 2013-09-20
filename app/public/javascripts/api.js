var DCaseAPI;
(function (DCaseAPI) {
    DCaseAPI.uri = Config.BASEPATH + "/api/1.0/";

    DCaseAPI.default_success_callback = function (result) {
    };

    DCaseAPI.default_error_callback = function (req, stat, err) {
        alert("ajax error");
    };

    DCaseAPI.call = function (method, params) {
        var cmd = {
            jsonrpc: "2.0",
            method: method,
            id: 1,
            params: params
        };
        var async = callback != null;
        var callback = this.default_success_callback;
        var error_callback = this.default_error_callback;
        var res = $.ajax({
            type: "POST",
            url: this.uri,
            async: async,
            data: JSON.stringify(cmd),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                callback(response.result);
            },
            error: error_callback
        });
        if (!async) {
            return JSON.parse(res.responseText).result;
        }
    };

    DCaseAPI.searchDCase = function (pageIndex, tags) {
        if (tags == null) {
            tags = [];
        }
        try  {
            return this.call("searchDCase", { page: pageIndex, tagList: tags });
        } catch (e) {
            return [];
        }
    };

    DCaseAPI.getProjectDCase = function (pageIndex, projectId) {
        return this.call("searchDCase", { page: pageIndex, projectId: projectId });
    };

    DCaseAPI.getProjectUser = function (projectId) {
        return this.call("getProjectUser", { projectId: projectId });
    };

    DCaseAPI.getProjectUserAndRole = function (projectId) {
        var users = this.call("getProjectUserAndRole", { projectId: projectId });
        return users ? users.userList : [];
    };

    DCaseAPI.createDCase = function (name, tree, projectId, summary) {
        return this.call("createDCase", {
            dcaseName: name,
            contents: tree,
            projectId: projectId,
            summary: JSON.stringify(summary)
        });
    };

    DCaseAPI.createProject = function (name, isPublic) {
        return this.call("createProject", {
            name: name,
            isPublic: isPublic
        });
    };

    DCaseAPI.editProject = function (projectId, name, isPublic) {
        return this.call("editProject", {
            projectId: projectId,
            name: name,
            isPublic: isPublic
        });
    };

    DCaseAPI.updateProjectUser = function (projectId, users) {
        return this.call("updateProjectUser", {
            projectId: projectId,
            users: users
        });
    };

    DCaseAPI.getCommitList = function (dcaseId) {
        return this.call("getCommitList", { dcaseId: dcaseId }).commitList;
    };

    DCaseAPI.getTagList = function () {
        return this.call("getTagList", {});
    };

    DCaseAPI.commit = function (tree, msg, commitId, summary) {
        return this.call("commit", {
            contents: tree,
            commitMessage: msg,
            commitId: commitId
        }).commitId;
    };

    DCaseAPI.getDCase = function (dcaseId) {
        return this.call("getDCase", { dcaseId: dcaseId });
    };

    DCaseAPI.getProjectList = function () {
        return this.call("getProjectList", {});
    };

    DCaseAPI.getPublicProjectList = function () {
        return this.call("getPublicProjectList", {});
    };

    DCaseAPI.getProject = function (projectId) {
        return this.call("getProject", { projectId: projectId });
    };

    DCaseAPI.deleteProject = function (projectId) {
        return this.call("deleteProject", { projectId: projectId });
    };

    DCaseAPI.editDCase = function (dcaseId, name) {
        return this.call("editDCase", {
            dcaseId: dcaseId,
            dcaseName: name
        });
    };

    DCaseAPI.deleteDCase = function (dcaseId) {
        return this.call("deleteDCase", { dcaseId: dcaseId });
    };

    DCaseAPI.getNodeTree = function (commitId) {
        return JSON.parse(this.call("getNodeTree", { commitId: commitId }).contents);
    };

    DCaseAPI.searchNode = function (text) {
        return this.call("searchNode", { text: text }).searchResultList;
    };

    DCaseAPI.searchDCaseHistory = function (dcaseId, text) {
        return this.call("searchDCaseHistory", { dcaseId: dcaseId, text: text });
    };

    DCaseAPI.createTicket = function (nodeId, subject, description, userName) {
        return this.call("createTicket", {
            nodeId: nodeId,
            subject: subject,
            description: description,
            userName: userName
        });
    };

    DCaseAPI.getUserById = function (userId) {
        return this.call("getUserById", { userId: userId });
    };

    DCaseAPI.getUserByName = function (userName) {
        return this.call("getUserByName", { userName: userName });
    };
})(DCaseAPI || (DCaseAPI = {}));
