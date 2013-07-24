import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_commit = module('../model/commit')
import model_monitor = module('../model/monitor')
import model_dcase = module('../model/dcase');
import model_node = module('../model/node');
import redmine = module('../net/redmine')
import error = module('./error')
var _ = require('underscore');

export function modifyMonitorStatus(params:any, userId:number, callback: type.Callback) {
	var commitMessage = 'monitor status exchange';

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
					MetaData: [metaData]}; 

		nodeList.push(node);

		return maxThisNodeId;
	}

	function removeRebuttalNode(nodeList: any, thisNodeId: number, rebuttalThisNodeId: number) : number {
		var rebuttalNodePos: number = -1;
		var rebuttalChildrenPos: number = -1;
		var issueId: number = undefined;

		for (var i = 0; i < nodeList.length; i++) {
			var node = nodeList[i];
			if (thisNodeId == node.ThisNodeId) {
				for (var j = 0; j < node.Children.length; j++) {
					if (node.Children[j] == rebuttalThisNodeId) {
						rebuttalChildrenPos = j;
					}	
				}
				if (rebuttalChildrenPos > -1) node.Children.splice(rebuttalChildrenPos, 1);
			}

			if (rebuttalThisNodeId == node.ThisNodeId) {
				rebuttalNodePos = i;
				var metaList = _.filter(node.MetaData, (meta:any) => {return meta.Type == 'Issue';});
				if (metaList.length > 0)
					issueId = metaList[0]._IssueId;
			}
		}
		if (rebuttalNodePos > -1) nodeList.splice(rebuttalNodePos, 1);

		return issueId;
	}

	function validate(params:any) {
		var checks = [];
		if (!params) checks.push('Parameter is required.');
		if (params && !params.evidenceId) checks.push('Evidence ID is required.');
		if (params && params.evidenceId && !isFinite(params.evidenceId) ) checks.push('Evidence ID must be a number.');	
		if (params && !params.systemNodeId) checks.push('System Node ID is required.');
		if (params && params.systemNodeId && !isFinite(params.systemNodeId) ) checks.push('System Node ID must be a number.');	
		if (params && !params.timestamp) checks.push('Timestamp is required.');
		if (params && !params.comment) checks.push('Comment is required.');
		if (params && !params.status) checks.push('Status is required.');
		if (params && params.status && !( params.status == 'OK' || params.status == 'NG')) checks.push('Status is OK or NG.');

		if (checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
			return false;
		}
		return true;
	}

	if (!validate(params)) return;

	var con = new db.Database();
	
	con.begin((err, result) => {
		var monitorDAO = new model_monitor.MonitorDAO(con);
		monitorDAO.select(params.systemNodeId, (err:any, dcaseId: number, thisNodeId: number, rebuttalThisNodeId: number) => {
			if (err) {
				callback.onFailure(err);
				con.close();
				return;
			}
			monitorDAO.getLatestCommit(dcaseId, (err:any, latestCommit: model_commit.Commit) => {
				if (err) {
					callback.onFailure(err);
					con.close();
					return;
				}

				var nodeDAO = new model_node.NodeDAO(con);
				nodeDAO.get(latestCommit.id, (err:any, nodeList: model_node.Node[]) => {
					if (err) {
						callback.onFailure(err);
						con.close();
						return;
					}
					if (nodeList.length == 0) {
						callback.onSuccess(null);
						con.close();
						return;		//有効なNodeがない場合は何もしない
					}

					var dcaseDAO = new model_dcase.DCaseDAO(con);
					dcaseDAO.get(dcaseId, (err, dcase:model_dcase.DCase) => {
						if (err) {
							if (err.code == error.RPC_ERROR.DATA_NOT_FOUND) {
								callback.onSuccess(null);
								con.close();
								return; //有効なDCaseがない場合は何もしない
							} else {
								callback.onFailure(err);
								con.close();
								return;
							}
						}
						if (dcase.deleteFlag) {
							callback.onSuccess(null);
							return;
						}

						var data = JSON.parse(latestCommit.data);
						var nodeList = data.NodeList;
						var rebuttalId : number = null;
						var issueId : number = null;

						if (rebuttalThisNodeId) {
							if (params.status == 'OK') {
								issueId = removeRebuttalNode(nodeList, thisNodeId, rebuttalThisNodeId);
								data.NodeCount--;
							} else {
								callback.onFailure(new error.InternalError('Rebuttal already exists. ', null));
								return;
							}
						} else {
							if (params.status == 'NG') {
								rebuttalId = addRebuttalNode(nodeList, params, thisNodeId);
								data.NodeCount++;
							} else {
								callback.onFailure(new error.InternalError('Rebuttal does not exist. ', null));
								return;
							}
						}
	
						var commitDAO = new model_commit.CommitDAO(con);
						commitDAO.commit(userId, latestCommit.id, commitMessage, data, (err, result) => {
							if (err) {
								callback.onFailure(err);
								return;
							}
	
							monitorDAO.setRebuttalThisNodeId(params.systemNodeId, rebuttalId, (err: any) => {
								if (err) {
									callback.onFailure(err);
									return;
								}
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
			});
		});
	});
}


