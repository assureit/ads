///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>
///<reference path='../../DefinitelyTyped/bootstrap/bootstrap.d.ts'/>
///<reference path='./api.ts'/>
///<reference path='./ads.ts'/>

interface CommitInformation {
	commitId: number;
	dateTime: string;
	commitMessage?: string;
	userId: number;
	userName?: string; //FIXME not Exist in DCaseAPI.getCommitList(...)
	latest?: bool;
}

class TimeLine {
	$timeline: JQuery;
	$canvas: JQuery;
	$container: JQuery;
	titleString : string = "";//FIXME

	visibleFlag: bool = false;
	scrollX: number = 0;
	mouseX: number = null;
	dragX: number = 0;

	selected: JQuery = null;
	MX: number = 24;
	MY: number = 24;
	NX: number = 50;
	NY: number = 30;

	argument: DCaseModel = null;
	onDCaseSelected: (dcaseId: number, commitId: number, isLatest: bool) => bool;


	constructor($root: JQuery) {
		this.titleString = "<div></div>";
		this.$timeline = $(this.titleString)    //FIXME
			.addClass("timeline")
			.css("display", "none")
			.appendTo($root);
		this.$canvas = $("<canvas></canvas>")
			.css("position", "absolute")
			.appendTo(this.$timeline);
		this.$container = $(this.titleString).css({
			position: "absolute", left: 0, top: 0,
		}).appendTo(this.$timeline);

		$(this.titleString)
			.addClass("timeline-title")
			.html("Commit History")
			.appendTo(this.$timeline);


	//--------------------------------------------------------
 
		this.$timeline.mousedown((e: JQueryMouseEventObject) => {
			this.mouseX = e.pageX;
		});

		this.$timeline.mousemove((e: JQueryMouseEventObject) => {
			if(this.mouseX != null) {
				this.dragX = e.pageX - this.mouseX;
				this.drag();
			}
		});

		this.$timeline.mouseup((e: JQueryMouseEventObject) => {
			this.scrollX += this.dragX;
			this.dragX = 0;
			this.mouseX = null;
			this.drag();
		});
	}

	//-------------------------------------------------------

	repaint(arg: DCaseModel): void {
		this.argument = arg;
		this.$container.empty();

		if(arg == null) {
			return;
		}

		var mm: any = {};
		console.log(arg.getArgumentId());
		var l: CommitInformation[] = DCaseAPI.getCommitList(arg.getArgumentId());
		for(var i: number = 0; i < l.length - 1; i++) {
			var x: number[] = [];
			if(mm[l[i].commitId]) x = mm[l[i].commitId];
			if(x.indexOf(l[i+1].commitId) == -1) x.push(l[i + 1].commitId);
			mm[l[i].commitId] = x;
			l[i].latest = false;
		}
		l[l.length-1].latest = true;

		var ci: any = {};
		for(var i: number = 0; i < l.length; i++) {
			ci[l[i].commitId] = l[i];
		}
		//$.each(DCaseAPI.getBranchList(arg.argId), function(i, br) {
		//	if(br != arg.commitId) {
		//		var l = DCaseAPI.call("getCommitList", { commitId: br }).commitIdList;
		//		for(var i=0; i<l.length-1; i++) {
		//			var x = mm[l[i]];
		//			if(x == null) x = [];
		//			if(x.indexOf(l[i+1]) == -1) x.push(l[i + 1]);
		//			mm[l[i]] = x;
		//		}
		//	}
		//});
		this.selected = null;

		var b: { w: number; h: number; } = this.calcSize(mm, 0, 0, l[0].commitId);
		b.w += this.MX * 2;
		b.h += this.MY * 2;
		this.$timeline.height(b.h);
		b.h -= this.MX / 2;
		this.$canvas.css("width" , b.w);
		this.$canvas.attr("width", b.w);
		this.$canvas.css("height" , b.h);
		this.$canvas.attr("height", b.h);

		this.$container.css("top", this.MX/2);
		this.$canvas.attr("top", this.MX/2);
		this.$canvas.css("top", this.MX/2);

		var ctx: CanvasRenderingContext2D = (<HTMLCanvasElement>this.$canvas[0]).getContext("2d"); //FIXME
		ctx.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
		ctx.beginPath();
		var y: number = this.put(ctx, mm, ci, 0, 0, l[0].commitId);
		ctx.stroke();

		this.scrollX = (this.$timeline.width() - b.w) / 2;
		this.drag();
	}

	visible(b?: bool): void {
		if(b == null) {
			this.visibleFlag = !this.visibleFlag;
		} else {
			this.visibleFlag = b;
		}
		this.$timeline.css("display", this.visibleFlag ? "block" : "none");
	}

	drag(): void {
		this.$container.css("left", this.scrollX + this.dragX);
		this.$canvas.attr("left", this.scrollX + this.dragX);
		this.$canvas.css("left", this.scrollX + this.dragX);
	}

	calcSize(mm: any, x: number, y: number, id: number): { w: number; h: number; } {
		var b: { w: number; h: number; } = { w: x, h: y };
		var c: number[] = mm[id];
		if(c != null) {
			var b1: { w: number; h: number; } = this.calcSize(mm, x+this.NX, y, c[0]);
			b.w = Math.max(b.w, b1.w);
			y = b.h = Math.max(b.h, b1.h);
			for(var i: number = 1; i < c.length; i++) {
				var b2: { w: number; h: number; } = this.calcSize(mm, x+this.NX, y+this.NY, c[i]);
				b.w = Math.max(b.w, b2.w);
				y = b.h = Math.max(b.h, b2.h);
			}
		}
		return b;
	}

	put(ctx: CanvasRenderingContext2D, mm: any, l: any, x: number, y: number, id: number): number {
		this.addCommitMark(x, y, l, id);
		var c: number[] = mm[id];
		if(c != null) {
			var y0: number = y;
			y = this.put(ctx, mm, l, x+this.NX, y, c[0]);
			ctx.moveTo(x+this.MX/2   , y0+this.MY/2);
			ctx.lineTo(x+this.MX/2+this.NX, y0+this.MY/2);
			for(var i: number = 1; i < c.length; i++) {
				var y1: number = y;
				y = this.put(ctx, mm, l, x+this.NX, y+this.NY, c[i]);
				ctx.moveTo(x+this.MX/2   , y0+this.MY/2);
				ctx.lineTo(x+this.MX/2   , y1+this.NY+this.MY/2);
				ctx.lineTo(x+this.MX/2+this.NX, y1+this.NY+this.MY/2);
			}
		}
		return y;
	}

	addCommitMark(x: number, y: number, list: any, commitId: number): void {
		var $d: JQuery = $(this.titleString).css({
			left: x, top: y, width: this.MX, height: this.MY,
		}).addClass("timeline-commit").appendTo(this.$container);

		var info: CommitInformation = list[commitId];
		//var timefmt = DateFormatter(info.time).format();

		$d.popover({
			placement: "bottom",
			title: info.dateTime + " " + info.userName,
			content: info.commitMessage,
			trigger: "hover",
		});

		$d.click(() => {
			console.log("arguemnt " + commitId);
			if(this.selected != $d) {
				var argId: number = this.argument.argId;
				if(this.onDCaseSelected(argId, commitId, info.latest)) {
					if(this.selected != null) {
						this.selected.css("border-color", "");
						this.selected = $d;
					}
					$d.css("border-color", "orange");
				}
			}
		});

		if(commitId == this.argument.commitId) {
			$d.css("border-color", "orange");
			this.selected = $d;
		}
	}

}

class TimeLineView {
	timeline: TimeLine;

	constructor($body: JQuery, viewer: DCaseViewer, isLogin: bool) {
		this.timeline = new TimeLine($body);

		$("#menu-history-toggle").click((e: JQueryEventObject) => {
			this.timeline.visible();
			e.preventDefault();
		});

		this.timeline.onDCaseSelected = (dcaseId: number, commitId: number, isLatest: bool) => {
			var dcase: DCaseModel = viewer.getDCase();
			//var dcase_latest = dcase;
			if(dcase != null && dcase.isChanged()) {
				viewer.dcase_latest = dcase;
			}
			viewer.editable = isLatest && isLogin; //FIXME
			if(isLatest && viewer.dcase_latest != null) {
				viewer.setDCase(viewer.dcase_latest);
			} else {
				var tree: DCaseTreeRawData = DCaseAPI.getNodeTree(commitId);
				viewer.setDCase(new DCaseModel(tree, dcaseId, commitId));
			}
			return true;
		};

	}

	repaint(dcase: DCaseModel) : void {
		this.timeline.repaint(dcase);
	}
}
