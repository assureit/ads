import model = module('./model')
import model_dcase = module('./dcase')

export interface NodeData {
	ThisNodeId: number;
	Description: string;
	NodeType: string;
}
export class Node {
	public dcase: model_dcase.DCase;
	constructor(public id: number, public commitId: number, public thisNodeId: number, public nodeType: string, public description: string) {}
}
export class NodeDAO extends model.Model {
	insert(commitId: number, data: NodeData, callback: (nodeId: number)=>void): void {
		// TODO: node propertyをどうするべきか？TicketやMonitorに変更するべきか、meta.ticket1.id、meta.ticket1.nameなどとして並列にするか
		this.con.query('INSERT INTO node(this_node_id, description, node_type, commit_id) VALUES(?,?,?,?)', 
			[data.ThisNodeId, data.Description, data.NodeType, commitId], (err, result) => {
			if (err) {
				this.con.rollback();
				this.con.close();
				throw err;
			}
			callback(result.insertId);
		});
	}

	insertList(commitId: number, list: NodeData[], callback: ()=> void): void {
		if (list.length == 0) {
			callback();
			return;
		}
		this.insert(commitId, list[0], (nodeId: number) => {
			this.insertList(commitId, list.slice(1), callback);
		});
	}


	search(query: string, callback: (list: Node[]) => void) {
		// TODO: 全文検索エンジン対応
		this.con.query({sql:'SELECT * FROM node n, commit c, dcase d WHERE n.commit_id=c.id AND c.dcase_id=d.id AND c.latest_flag=TRUE AND n.description LIKE ?', nestTables:true}, 
			['%' + query + '%'], (err, result) => {
			if (err) {
				this.con.rollback();
				this.con.close();
				throw err;
			}
			var list = new Node[];
			result.forEach((row) => {
				var node = new Node(row.n.id, row.n.commit_id, row.n.this_node_id, row.n.node_type, row.n.description);
				node.dcase = new model_dcase.DCase(row.d.id, row.d.name, row.d.user_id, row.d.delete_flag);
				list.push(node);
			});
			callback(list);
		});
	}
}

