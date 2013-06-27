import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_commit = module('../model/commit')
import model_monitor = module('../model/monitor')
import redmine = module('../net/redmine')
import error = module('./error')

export function modifyMonitorStatus(params:any, callback: type.Callback) {

	function addRebuttalNode(nodeList: any, params: any, thisNodeId: number) : number {
		var maxThisNodeId = 0;

		nodeList.forEach((node) => {
			if (maxThisNodeId < node.ThisNodeId) maxThisNodeId = node.ThisNodeId;
		});
		maxThisNodeId++;
		nodeList.forEach((node) => {
			if (thisNodeId == node.ThisNodeId) {
				node.Children.push(maxThisNodeId) 
			}
		});

		var metaData: any = {	Type: 'Issue',
					Subject: constant.REBUTTAL_SUBJECT,
					Description: constant.REBUTTAL_DESCRIPTION + '\r\n' + params.comment,
					Timestamp: params.timestamp,
					Visible: 'true'};
		var node: any = {	ThisNodeId: maxThisNodeId,
					Description: params.comment,
					Children: [],
					NodeType: 'Rebuttal',
					MetaData: metaData}; 

		nodeList.push(node);

		return maxThisNodeId;
	}

	function removeRebuttalNode(nodeList: any, thisNodeId: number, rebuttalThisNodeId: number) : number {
		var rebuttalNodePos: number = -1;
		var rebuttalChildrenPos: number = -1;
		var issueId: number = -1;

		for (var i = 0; i < nodeList.length; i++) {
			var node = nodeList[i];
			if (thisNodeId == node.thisNodeId) {
				for (var j = 0; j < node.Children.length; j++) {
					if (node.Children[j] == rebuttalThisNodeId) {
						rebuttalChildrenPos = j;
					}	
				}
				if (rebuttalChildrenPos > -1) node.Children.splice(rebuttalChildrenPos, 1);
			}

			if (rebuttalThisNodeId == node.thisNodeId) {
				rebuttalNodePos = i;
				issueId = node.MetaData._IssueId;
			}
		}
		if (rebuttalNodePos > -1) nodeList.splice(rebuttalNodePos, 1);

		return issueId;
	}



	var con = new db.Database();
	
	con.begin((err, result) => {
		var monitorDAO = new model_monitor.monitorDAO(con);
		monitorDAO.select(params.systemNodeId, (err:any, dcaseId: number, thisNodeId: number, rebuttalThisNodeId: number) => {
			if (err) {
				callback.onFailure(err);
				return;
			}
			monitorDAO.getLatestCommit(dcaseId, (err:any, latestCommit: model_commit.Commit) => {
				if (err) {
					callback.onFailure(err);
					return;
				}

				var data = JSON.parse(latestCommit.data);
				var nodeList = data.NodeList;
				var rebuttalId : number = null;
				var issueId : number = null;

				if (rebuttalThisNodeId) {
					if (params.status == 'OK') {
						issueId = removeRebuttalNode(nodeList, thisNodeId, rebuttalThisNodeId);	
					} else {
						callback.onFailure(new error.InternalError('Rebuttal already exists. ', null));
						return;
					}
				} else {
					if (params.status == 'NG') {
						rebuttalId = addRebuttalNode(nodeList, params, thisNodeId);
					} else {
						callback.onFailure(new error.InternalError('Rebuttal does not exist. ', null));
						return;
					}
				}

				var commit_params: any = { contents: nodeList,
							   commitId: latestCommit.id,
							   commitMessage: ''};
			
				//commit処理
				
				monitorDAO.update(params.systemNodeId, rebuttalId, (err: any) => {
					if (err) {
						callback.onFailure(err);
						return;
					}
					console.log(issueId);
					if (issueId) {
						monitorDAO.getItsId(issueId, (err: any, itsId: string) => {
							if (err) {
								callback.onFailure(err);
								return;
							}
							var redmineIssue = new redmine.Issue();
							redmineIssue.addComment(itsId, params.comment, (err:any, result:any)  => {
								if (err) {
									callback.onFailure(err);
									return;
								}
								con.commit((err, result) =>{
									callback.onSuccess(null);
									con.close();
								});				
							});
						});		
					} else {
						con.commit((err, result) =>{
							callback.onSuccess(null);
							con.close();
						});
					}				
				});
			});
		});
	});
}


