var CommitModel = (function () {
    function CommitModel(CommitId, Message, time, userId, userName, LatestFlag, caseId, revisionId) {
        this.CommitId = CommitId;
        this.Message = Message;
        this.userId = userId;
        this.userName = userName;
        this.LatestFlag = LatestFlag;
        this.caseId = caseId;
        this.revisionId = revisionId;
        if (Message == "" || Message == null) {
            this.Message = "(No message)";
        }
        this.dateTimeString = (new Date(time)).toString();
        this.dateTime = TimeUtil.formatDate(time);
    }
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
            CommitModels.push(new CommitModel(j.commitId, j.commitMessage, j.dateTime, j.userId, j.userName, false, caseId, i));
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
        $(this.selector).append(($)("#history_tmpl").tmpl(commits.CommitModels));
    };
    return HistoryView;
})();
