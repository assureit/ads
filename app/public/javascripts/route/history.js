var CommitModel = (function () {
    function CommitModel(CommitId, Message, summary, time, userId, userName, LatestFlag, caseId, revisionId) {
        this.CommitId = CommitId;
        this.Message = Message;
        this.userId = userId;
        this.userName = userName;
        this.LatestFlag = LatestFlag;
        this.caseId = caseId;
        this.revisionId = revisionId;
        this.count = 0;
        this.added = 0;
        this.modified = 0;
        this.deleted = 0;
        this.addedString = "";
        this.modifiedString = "";
        this.deletedString = "";
        if (Message == "" || Message == null) {
            this.Message = "(No message)";
        }
        if (summary != "" && summary != null) {
            this.summary = JSON.parse(summary);
            this.CheckSummary();
        } else {
            this.summary = {};
        }
        this.dateTimeString = (new Date(time)).toString();
        this.dateTime = TimeUtil.formatDate(time);
    }
    CommitModel.prototype.StringifyNodeList = function (list) {
        var res = "";
        for (var i in list) {
            res += list[i] + ", ";
        }
        res = res.substring(0, res.length - 2);
        return res;
    };

    CommitModel.prototype.CheckSummary = function () {
        if (this.summary) {
            this.count = this.summary.count;
            if (this.summary.added && this.summary.added.length) {
                this.added = this.summary.added.length;
                this.addedString = this.StringifyNodeList(this.summary.added);
            } else {
                this.added = 0;
                this.addedString = "";
            }
            if (this.summary.modified && this.summary.modified.length) {
                this.modified = this.summary.modified.length;
                this.modifiedString = this.StringifyNodeList(this.summary.modified);
            } else {
                this.modified = 0;
                this.modifiedString = "";
            }
            if (this.summary.deleted && this.summary.deleted.length) {
                this.deleted = this.summary.deleted.length;
                this.deletedString = this.StringifyNodeList(this.summary.deleted);
            } else {
                this.deleted = 0;
                this.deletedString = "";
            }
        }
    };
    return CommitModel;
})();

var CommitCollection = (function () {
    function CommitCollection(CommitModels) {
        if (CommitModels == null) {
            CommitModels = [];
        }
        this.CommitModels = CommitModels;
    }
    CommitCollection.prototype.Append = function (CommitModel) {
        this.CommitModels.push(CommitModel);
    };

    CommitCollection.FromJson = function (json_array, caseId) {
        var CommitModels = [];
        for (var i = 0; i < json_array.length; i++) {
            var j = json_array[i];
            CommitModels.push(new CommitModel(j.commitId, j.commitMessage, j.summary, j.dateTime, j.userId, j.userName, false, caseId, i));
        }
        CommitModels[json_array.length - 1].LatestFlag = true;
        return new CommitCollection(CommitModels);
    };

    CommitCollection.prototype.reverse = function () {
        var models = [];
        for (var i = this.CommitModels.length - 1; i >= 0; i--) {
            models.push(this.CommitModels[i]);
        }
        this.CommitModels = models;
    };

    CommitCollection.prototype.forEach = function (callback) {
        for (var i = 0; i < this.CommitModels.length; i++) {
            callback(i, this.CommitModels[i]);
        }
    };
    return CommitCollection;
})();

var HistoryView = (function () {
    function HistoryView() {
        this.selector = "#history-list";
        this.selectorChildren = this.selector + " *";
    }
    HistoryView.prototype.clear = function () {
        $(this.selectorChildren).remove();
    };

    HistoryView.prototype.addElements = function (caseId) {
        var commitList = DCaseAPI.getCommitList(caseId);
        var commits = CommitCollection.FromJson(commitList, caseId);
        commits.reverse();
        $("#history_tmpl").tmpl(commits.CommitModels).appendTo($(this.selector));
    };
    return HistoryView;
})();

$(function () {
    var idMatchResult = location.pathname.match(/case\/(\d+)/);
    var caseId = idMatchResult ? idMatchResult[1] - 0 : 0;
    var list = new HistoryView();
    list.addElements(caseId);
});
