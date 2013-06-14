var DCaseAPI = new Object();

DCaseAPI.uri = "/api/1.0/";

DCaseAPI.default_success_callback = function(result) {
	// do nothing
};

DCaseAPI.default_error_callback = function(req, stat, err) {
	alert("ajax error");
};

DCaseAPI.call = function(method, params, callback, error_callback) {
	var cmd = {
		jsonrpc: "2.0",
		method: method,
		id: 1,
		params: params
	};
	var async = callback != null;
	if(callback == null) callback = this.default_success_callback;
	if(error_callback == null) error_callback = this.default_error_callback;
	var res = $.ajax({
		type: "POST",
		url: this.uri,
		async: async,
		data: JSON.stringify(cmd),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function(response) {
			callback(response.result);
		},
		error: error_callback
	});
	if(!async) {
		return JSON.parse(res.responseText).result;
	}
};

//-------------------------------------

DCaseAPI.searchDCase = function(pageIndex, callback, error) {
	try{
		return this.call("searchDCase", {page: pageIndex}, callback, error);
	}catch(e){
		return [];
	}
};

DCaseAPI.createDCase = function(name, tree, callback, error) {
	return this.call("createDCase", {
		dcaseName: name, contents: tree }, callback, error);
};

DCaseAPI.getCommitList = function(dcaseId, callback, error) {
	return this.call("getCommitList", { dcaseId:dcaseId }, callback, error).commitList;
};

DCaseAPI.commit = function(tree, msg, commitId, callback, error) {
	return this.call("commit", {
		contents: tree,
		commitMessage: msg,
		commitId: commitId, 
//		userId: userId
	}, callback, error).commitId;
};

DCaseAPI.getDCase = function(dcaseId, callback, error) {
	return this.call("getDCase", { dcaseId: dcaseId }, callback, error);
};

DCaseAPI.editDCase = function(dcaseId, name, callback, error) {
	return this.call("editDCase", {
		dcaseId: dcaseId,
		dcaseName: name
	}, callback, error);
};

DCaseAPI.deleteDCase = function(dcaseId, callback, error) {
	return this.call("deleteDCase", { dcaseId: dcaseId }, callback, error);
};

DCaseAPI.getNodeTree = function(commitId, callback, error) {
	return JSON.parse(this.call("getNodeTree", { commitId: commitId }, callback, error).contents);
};

DCaseAPI.searchNode = function(text, callback, error) {
	return this.call("searchNode", { text: text }, callback, error).searchResultList;
};

DCaseAPI.searchDCaseHistory = function(dcaseId, text, callback, error) {
    return this.call("searchDCaseHistory", {dcaseId: dcaseId, text: text}, callback, error);
};

DCaseAPI.createTicket = function(nodeId, subject, description, userName, callback, error) {
    return this.call("createTicket", {
        nodeId: nodeId,
        subject: subject,
        description: description,
        userName: userName
    }, callback, error);
};
