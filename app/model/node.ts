import model = module('./model')
import model_dcase = module('./dcase')
import model_pager = module('./pager')
import model_issue = module('./issue')

export interface MetaData {
	Type: string;
	Subject?: string;
	Description?: string;
	Visible?:string;
	IssueId?: number;
}
export interface NodeData {
	ThisNodeId: number;
	Description: string;
	NodeType: string;
	Children?: number[];
	Contexts?: number[];
	MetaData?: MetaData[];
}
export class Node {
	public dcase: model_dcase.DCase;
	constructor(public id: number, public commitId: number, public thisNodeId: number, public nodeType: string, public description: string) {}
}
export class NodeDAO extends model.DAO {
	/**
	 * DCaseノード毎に事前処理を行う。
	 * 事前処理：
	 *   イシュー発行
	 *   モニタ作成
	 */
	processNodeList(dcaseId:number, commitId:number, list: NodeData[], callback: (err:any)=>void): void {
		if (list.length == 0) {
			callback(null);
			return;
		}
		this.processMetaDataList(dcaseId, commitId, list[0].MetaData, (err:any) => {
			if (err) {
				callback(err);
				return;
			}
			this.processNodeList(dcaseId, commitId, list.slice(1), callback);
		});
	}

	processMetaDataList(dcaseId:number, commitId:number, list:MetaData[], callback: (err:any)=>void): void {
		if (!list || list.length == 0) {
			callback(null);
			return;
		}
		this.processMetaData(dcaseId, commitId, list[0], (err:any) => {
			if (err) {
				callback(err);
				return;
			}
			this.processMetaDataList(dcaseId, commitId, list.slice(1), callback);
		});
	}
	processMetaData(dcaseId:number, commitId:number, meta:MetaData, callback: (err:any)=>void): void {
		if (meta.Type == 'Issue' && !meta.IssueId) {
			var issueDAO = new model_issue.IssueDAO(this.con);
			issueDAO.insert(new model_issue.Issue(0, dcaseId, null, meta.Subject, meta.Description), (err:any, result:model_issue.Issue) => {
				meta.IssueId = result.id;
				callback(null);
			});
		} else {
			callback(null);
		}
	}
	insert(commitId: number, data: NodeData, callback: (err:any, nodeId: number)=>void): void {
		// TODO: node propertyをどうするべきか？TicketやMonitorに変更するべきか、meta.ticket1.id、meta.ticket1.nameなどとして並列にするか
		this.con.query('INSERT INTO node(this_node_id, description, node_type, commit_id) VALUES(?,?,?,?)', 
			[data.ThisNodeId, data.Description, data.NodeType, commitId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);
		});
	}

	insertList(dcaseId:number, commitId: number, list: NodeData[], callback: (err:any)=> void): void {
		if (list.length == 0) {
			callback(null);
			return;
		}
		this.processNodeList(dcaseId, commitId, list, (err:any) => {
			if (err) {
				callback(err);
				return;
			}
			this.insert(commitId, list[0], (err:any, nodeId: number) => {
				if (err) {
					callback(err);
					return;
				}
				this.insertList(dcaseId, commitId, list.slice(1), callback);
			});
		});
	}


	search(page: number, query: string, callback: (err:any, pager: model_pager.Pager, list: Node[]) => void) {
		// TODO: 全文検索エンジン対応
		var pager = new model_pager.Pager(page);
		query = '%' + query + '%';
		this.con.query({sql:'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? LIMIT ? OFFSET ? ', nestTables:true}, 
			[query, pager.limit, pager.getOffset()], (err, result) => {
			if (err) {
				callback(err, null, null);
				return;
			}
			var list = new Node[];
			result.forEach((row) => {
				var node = new Node(row.n.id, row.n.commit_id, row.n.this_node_id, row.n.node_type, row.n.description);
				node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
				list.push(node);
			});

			this.con.query('SELECT count(d.id) as cnt from node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ? ', [query], (err, countResult) => {
				if (err) {
					callback(err, null, null);
					return;
				}
				pager.totalItems = countResult[0].cnt;
				callback(err, pager, list);
			});
		});
	}
}

