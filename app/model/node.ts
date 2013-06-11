import model = module('./model')

export interface NodeData {
	ThisNodeId: number;
	Description: string;
	NodeType: string;
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
			console.log(nodeId);
			this.insertList(commitId, list.slice(1), callback);
		});
	}
}

