///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

module DCaseAPI {

	export var uri = Config.BASEPATH + "/api/1.0/";

	export var default_success_callback = function(result) {
		// do nothing
	};

	export var default_error_callback = function(req, stat, err) {
		alert("ajax error");
	};

	export var call = function(method, params) {
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

	export var searchDCase = function(pageIndex: any, tags?: string[]) {
		if(tags == null) {
			tags = [];
		}
		try{
			return this.call("searchDCase", {page: pageIndex, tagList: tags});
		}catch(e){
			return [];
		}
	};

	export var createDCase = function(name, tree) {
		return this.call("createDCase", {
			dcaseName: name, contents: tree });
	};

	export var createProject = function(name, isPublic) {
		return this.call("createProject", {
			name: name, isPublic: isPublic });
	};

	export var getCommitList = function(dcaseId) {
		return this.call("getCommitList", { dcaseId:dcaseId }).commitList;
	};

	export var getTagList = function() {
		return this.call("getTagList", {});
	};

	export var commit = function(tree, msg, commitId) {
		return this.call("commit", {
			contents: tree,
			commitMessage: msg,
			commitId: commitId, 
	//		userId: userId
		}).commitId;
	};
	
	export var getDCase = function(dcaseId) {
		return this.call("getDCase", { dcaseId: dcaseId });
	};

	export var getProjectList = function(userId) {
		return this.call("getProjectList", { userId: userId });
	};
	
	export var editDCase = function(dcaseId, name) {
		return this.call("editDCase", {
			dcaseId: dcaseId,
			dcaseName: name
		});
	};
	
	export var deleteDCase = function(dcaseId) {
		return this.call("deleteDCase", { dcaseId: dcaseId });
	};
	
	export var getNodeTree = function(commitId) {
		return JSON.parse(this.call("getNodeTree", { commitId: commitId }).contents);
	};
	
	export var searchNode = function(text) {
		return this.call("searchNode", { text: text }).searchResultList;
	};
	
	export var searchDCaseHistory = function(dcaseId, text) {
		return this.call("searchDCaseHistory", {dcaseId: dcaseId, text: text});
	};
	
	export var createTicket = function(nodeId, subject, description, userName) {
	    return this.call("createTicket", {
	        nodeId: nodeId,
	        subject: subject,
	        description: description,
	        userName: userName
	    });
	};
}
