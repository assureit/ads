var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')


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
    return IssueDAO;
})(model.DAO);
exports.IssueDAO = IssueDAO;
