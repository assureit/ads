import model = module('./model')
import domain = module('domain')
import error = module('../api/error')

export class Issue {
	constructor(public id:number, public dcaseId: number, public itsId: string, public subject: string, public description:string) {}
}

export class IssueDAO extends model.DAO {
	insert(issue: Issue, callback: (err:any, created: Issue) => void) {
		this.con.query('INSERT INTO issue(dcase_id, subject, description) VALUES(?, ?, ?) ', [issue.dcaseId, issue.subject, issue.description], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			issue.id = result.insertId;
			callback(null, issue);
		});
	}
}
