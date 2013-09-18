///<reference path='../../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../../types/jquery_plugins.d.ts'/>
///<reference path='../api.ts'/>

class CommitModel {
	dateTime: string;
	dateTimeString: string;
	constructor(public CommitId: number, public Message:string,
			time: string, public userId:number,
			public userName: string, public LatestFlag: boolean,
			public caseId: number, public revisionId: number) {
		if(Message == ""|| Message == null) {
			this.Message = "(No message)";
		}
		this.dateTimeString = (new Date(time)).toString();
		this.dateTime = TimeUtil.formatDate(time);
	}

}

class CommitCollection {
	CommitModels: CommitModel[];

	constructor(CommitModels?: CommitModel[]) {
		if(CommitModels == null) {
			CommitModels = [];
		}
		this.CommitModels = CommitModels;
	}

	Append(CommitModel: CommitModel): void {
		this.CommitModels.push(CommitModel);
	}

	static FromJson(json_array: any[], caseId: number): CommitCollection {
		var CommitModels: CommitModel[] = [];
		for(var i: number = 0; i < json_array.length; i++) {
			var j = json_array[i];
			CommitModels.push(new CommitModel(j.commitId, j.commitMessage, j.dateTime, j.userId, j.userName, false, caseId, i));
		}
		CommitModels[json_array.length - 1].LatestFlag = true; //Latest one
		return new CommitCollection(CommitModels);
	}

	reverse(): void {
		var models: CommitModel[] = [];
		for(var i: number = this.CommitModels.length-1 ; i >= 0; i--) {
			models.push(this.CommitModels[i]);
		}
		this.CommitModels = models;
	}

	forEach(callback: (i:number, v: CommitModel)=>void): void {
		for(var i: number = 0; i < this.CommitModels.length; i++) {
			callback(i, this.CommitModels[i]);
		}
	}
}

class HistoryView {
	selector: string;
	selectorChildren: string;

	constructor() {
		this.selector = "#history-list";
		this.selectorChildren = this.selector + " *";
	}

	clear(): void {
		$(this.selectorChildren).remove();
	}

	addElements(caseId: number): void {
		var commitList: any[] = DCaseAPI.getCommitList(caseId);
		var commits: CommitCollection = CommitCollection.FromJson(commitList, caseId);
		commits.reverse();
		$("#history_tmpl").tmpl(commits.CommitModels).appendTo($(this.selector));
	}
}

$(()=>{
	var idMatchResult = location.pathname.match(/case\/(\d+)/);
	var caseId: number = idMatchResult ? <any>idMatchResult[1]-0 : 0;
    var list = new HistoryView();
    list.addElements(caseId);
});
