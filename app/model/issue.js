var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')


var redmine = require('../net/redmine')
var Issue = (function () {
    function Issue(id, dcaseId, itsId, subject, description) {
        this.id = id;
        this.dcaseId = dcaseId;
        this.itsId = itsId;
        this.subject = subject;
        this.description = description;
    }
    return Issue;
})();
exports.Issue = Issue;
var IssueDAO = (function (_super) {
    __extends(IssueDAO, _super);
    function IssueDAO() {
        _super.apply(this, arguments);

    }
    IssueDAO.prototype.insert = function (issue, callback) {
        this.con.query('INSERT INTO issue(dcase_id, subject, description) VALUES(?, ?, ?) ', [
            issue.dcaseId, 
            issue.subject, 
            issue.description
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            issue.id = result.insertId;
            callback(null, issue);
        });
    };
    IssueDAO.prototype.updatePublished = function (issue, callback) {
        this.con.query('UPDATE issue SET its_id=? WHERE id=?', [
            issue.itsId, 
            issue.id
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            issue.id = result.insertId;
            callback(null, issue);
        });
    };
    IssueDAO.prototype.listNotPublished = function (dcaseId, callback) {
        this.con.query('SELECT * FROM issue WHERE dcase_id=? AND its_id is null', [
            dcaseId
        ], function (err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            var list = [];
            result.forEach(function (it) {
                list.push(new Issue(it.id, it.dcase_id, it.its_id, it.subject, it.description));
            });
            callback(null, list);
        });
    };
    IssueDAO.prototype.publish = function (dcaseId, callback) {
        var _this = this;
        this.listNotPublished(dcaseId, function (err, issueList) {
            if(err) {
                callback(err);
                return;
            }
            _this._publish(issueList, callback);
        });
    };
    IssueDAO.prototype._publish = function (issueList, callback) {
        var _this = this;
        if(!issueList || issueList.length == 0) {
            callback(null);
            return;
        }
        var issue = issueList[0];
        var redmineIssue = new redmine.Issue();
        redmineIssue.createSimple(issue.subject, issue.description, function (err, result) {
            if(err) {
                callback(err);
                return;
            }
            issue.itsId = result.issue.id;
            _this.updatePublished(issue, function (err, updated) {
                if(err) {
                    callback(err);
                    return;
                }
                _this._publish(issueList.slice(1), callback);
            });
        });
    };
    return IssueDAO;
})(model.DAO);
exports.IssueDAO = IssueDAO;
