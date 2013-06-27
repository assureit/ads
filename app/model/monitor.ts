import model = module('./model')
import model_commit = module('./commit')
import error = module('../api/error');

export interface InsertMonitor {
        dcaseId: number;
        thisNodeId: number;
        preSetId?: number;
        params?: string;
}


export class monitorDAO extends model.DAO {

	insert(param: InsertMonitor, callback: (err: any, id: number) => void) {
		this.con.query('INSERT INTO monitor_node(dcase_id, this_node_id, preset_id, params) VALUES(?,?,?,?) ', 
				[param.dcaseId, param.thisNodeId , param.preSetId, param.params], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, result.insertId);

		});
	}

	update(id: number, rebuttal_id: number, callback: (err: any) => void) {
		this.con.query('UPDATE monitor_node  SET rebuttal_this_node_id = ? where id = ?', [rebuttal_id, id], (err, result) => {
			if (err) {
				callback(err);
				return;
			}
			callback(err);

		});


	}

	select(id: number, callback: (err: any, dcaseId: number, thisNodeId: number, rebuttalThisNodeId: number) => void) {
		this.con.query('SELECT dcase_id, this_node_id, rebuttal_this_node_id  from monitor_node where id = ?', [id], (err, result) => {
			if (err) {
				callback(err, null, null, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('Specified id was not found. '), null, null, null); 
				return;
			}
			callback(err, result[0].dcase_id, result[0].this_node_id, result[0].rebuttal_this_node_id);
		});
	} 


	getLatestCommit(dcaseId: number, callback: (err: any, latestCommit: model_commit.Commit) => void) {
		this.con.query('SELECT * FROM commit WHERE dcase_id = ? AND latest_flag = TRUE', [dcaseId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('Specified dcase_id was not found. '), null); 
				return;
			}

			result = result[0];
			callback(err, new model_commit.Commit(result.id, result.prev_commit_id, result.dcase_id, result.user_id, result.message, result.data, result.date_time, result.latest_flag));
				
		});
	}

	getItsId(issueId: number, callback: (err: any, itsId: string) => void) {
		this.con.query('SELECT its_id FROM issue WHERE id = ?', [issueId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			if (result.length == 0) {
				callback(new error.NotFoundError('ITSID was not found.'), null);
				return;
			}
			callback(err, result[0].its_id);	

		});
	}
}
