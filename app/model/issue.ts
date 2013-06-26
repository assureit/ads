import model = module('./model')
import domain = module('domain')
import error = module('../api/error')
import redmine = module('../net/redmine')

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

	updatePublished(issue:Issue, callback: (err:any, updated: Issue) => void) {
		this.con.query('UPDATE issue SET its_id=? WHERE id=?', [issue.itsId, issue.id], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			issue.id = result.insertId;
			callback(null, issue);
		});
	}

	listNotPublished(dcaseId: number, callback: (err:any, result:Issue[]) => void) {
		this.con.query('SELECT * FROM issue WHERE dcase_id=? AND its_id is null', [dcaseId], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			var list = [];
			result.forEach((it:any) => {
				list.push(new Issue(it.id, it.dcase_id, it.its_id, it.subject, it.description));
			});
			callback(null, list);
		});
	}

	publish(dcaseId: number, callback: (err:any) => void) {
		this.listNotPublished(dcaseId, (err:any, issueList:Issue[]) => {
			if(err) {
				callback(err);
				return;
			}
			this._publish(issueList, callback);
		});
	}

	_publish(issueList:Issue[], callback: (err:any) => void) {
		if (!issueList || issueList.length == 0) {
			callback(null);
			return;
		}
		var issue = issueList[0];
		var redmineIssue = new redmine.Issue();
		redmineIssue.createSimple(issue.subject, issue.description, (err:any, result:any) => {
			if(err) {
				callback(err);
				return;
			}
			issue.itsId = result.issue.id;
			this.updatePublished(issue, (err:any, updated:Issue) => {
				if(err) {
					callback(err);
					return;
				}
				this._publish(issueList.slice(1), callback);
			});
		});
	}
}
