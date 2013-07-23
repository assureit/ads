var TimeLine = (function () {
    function TimeLine($root) {
        var _this = this;
        this.titleString = "";
        this.visibleFlag = false;
        this.scrollX = 0;
        this.mouseX = null;
        this.dragX = 0;
        this.selected = null;
        this.MX = 24;
        this.MY = 24;
        this.NX = 50;
        this.NY = 30;
        this.argument = null;
        this.titleString = "<div></div>";
        this.$timeline = $(this.titleString).addClass("timeline").css("display", "none").appendTo($root);
        this.$canvas = $("<canvas></canvas>").css("position", "absolute").appendTo(this.$timeline);
        this.$container = $(this.titleString).css({
            position: "absolute",
            left: 0,
            top: 0
        }).appendTo(this.$timeline);

        $(this.titleString).addClass("timeline-title").html("Commit History").appendTo(this.$timeline);

        this.$timeline.mousedown(function (e) {
            _this.mouseX = e.pageX;
        });

        this.$timeline.mousemove(function (e) {
            if (_this.mouseX != null) {
                _this.dragX = e.pageX - _this.mouseX;
                _this.drag();
            }
        });

        this.$timeline.mouseup(function (e) {
            _this.scrollX += _this.dragX;
            _this.dragX = 0;
            _this.mouseX = null;
            _this.drag();
        });
    }
    TimeLine.prototype.repaint = function (arg) {
        this.argument = arg;
        this.$container.empty();

        if (arg == null) {
            return;
        }

        var mm = {};
        console.log(arg.getArgumentId());
        var l = DCaseAPI.getCommitList(arg.getArgumentId());
        for (var i = 0; i < l.length - 1; i++) {
            var x = [];
            if (mm[l[i].commitId])
                x = mm[l[i].commitId];
            if (x.indexOf(l[i + 1].commitId) == -1)
                x.push(l[i + 1].commitId);
            mm[l[i].commitId] = x;
            l[i].latest = false;
        }
        l[l.length - 1].latest = true;

        var ci = {};
        for (var i = 0; i < l.length; i++) {
            ci[l[i].commitId] = l[i];
        }

        this.selected = null;

        var b = this.calcSize(mm, 0, 0, l[0].commitId);
        b.w += this.MX * 2;
        b.h += this.MY * 2;
        this.$timeline.height(b.h);
        b.h -= this.MX / 2;
        this.$canvas.css("width", b.w);
        this.$canvas.attr("width", b.w);
        this.$canvas.css("height", b.h);
        this.$canvas.attr("height", b.h);

        this.$container.css("top", this.MX / 2);
        this.$canvas.attr("top", this.MX / 2);
        this.$canvas.css("top", this.MX / 2);

        var ctx = (this.$canvas[0]).getContext("2d");
        ctx.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
        ctx.beginPath();
        var y = this.put(ctx, mm, ci, 0, 0, l[0].commitId);
        ctx.stroke();

        this.scrollX = (this.$timeline.width() - b.w) / 2;
        this.drag();
    };

    TimeLine.prototype.visible = function (b) {
        if (b == null) {
            this.visibleFlag = !this.visibleFlag;
        } else {
            this.visibleFlag = b;
        }
        this.$timeline.css("display", this.visibleFlag ? "block" : "none");
    };

    TimeLine.prototype.drag = function () {
        this.$container.css("left", this.scrollX + this.dragX);
        this.$canvas.attr("left", this.scrollX + this.dragX);
        this.$canvas.css("left", this.scrollX + this.dragX);
    };

    TimeLine.prototype.calcSize = function (mm, x, y, id) {
        var b = { w: x, h: y };
        var c = mm[id];
        if (c != null) {
            var b1 = this.calcSize(mm, x + this.NX, y, c[0]);
            b.w = Math.max(b.w, b1.w);
            y = b.h = Math.max(b.h, b1.h);
            for (var i = 1; i < c.length; i++) {
                var b2 = this.calcSize(mm, x + this.NX, y + this.NY, c[i]);
                b.w = Math.max(b.w, b2.w);
                y = b.h = Math.max(b.h, b2.h);
            }
        }
        return b;
    };

    TimeLine.prototype.put = function (ctx, mm, l, x, y, id) {
        this.addCommitMark(x, y, l, id);
        var c = mm[id];
        if (c != null) {
            var y0 = y;
            y = this.put(ctx, mm, l, x + this.NX, y, c[0]);
            ctx.moveTo(x + this.MX / 2, y0 + this.MY / 2);
            ctx.lineTo(x + this.MX / 2 + this.NX, y0 + this.MY / 2);
            for (var i = 1; i < c.length; i++) {
                var y1 = y;
                y = this.put(ctx, mm, l, x + this.NX, y + this.NY, c[i]);
                ctx.moveTo(x + this.MX / 2, y0 + this.MY / 2);
                ctx.lineTo(x + this.MX / 2, y1 + this.NY + this.MY / 2);
                ctx.lineTo(x + this.MX / 2 + this.NX, y1 + this.NY + this.MY / 2);
            }
        }
        return y;
    };

    TimeLine.prototype.addCommitMark = function (x, y, list, commitId) {
        var _this = this;
        var $d = $(this.titleString).css({
            left: x,
            top: y,
            width: this.MX,
            height: this.MY
        }).addClass("timeline-commit").appendTo(this.$container);

        var info = list[commitId];

        $d.popover({
            placement: "bottom",
            title: info.dateTime + " " + info.userName,
            content: info.commitMessage,
            trigger: "hover"
        });

        $d.click(function () {
            console.log("arguemnt " + commitId);
            if (_this.selected != $d) {
                var argId = _this.argument.argId;
                if (_this.onDCaseSelected(argId, commitId, info.latest)) {
                    if (_this.selected != null) {
                        _this.selected.css("border-color", "");
                        _this.selected = $d;
                    }
                    $d.css("border-color", "orange");
                }
            }
        });

        if (commitId == this.argument.commitId) {
            $d.css("border-color", "orange");
            this.selected = $d;
        }
    };
    return TimeLine;
})();

var TimeLineView = (function () {
    function TimeLineView($body, viewer, isLogin) {
        var _this = this;
        this.timeline = new TimeLine($body);

        $("#menu-history-toggle").click(function (e) {
            _this.timeline.visible();
            e.preventDefault();
        });

        this.timeline.onDCaseSelected = function (dcaseId, commitId, isLatest) {
            var dcase = viewer.getDCase();

            if (dcase != null && dcase.isChanged()) {
                viewer.dcase_latest = dcase;
            }
            viewer.editable = isLatest && isLogin;
            if (isLatest && viewer.dcase_latest != null) {
                viewer.setDCase(viewer.dcase_latest);
            } else {
                var tree = DCaseAPI.getNodeTree(commitId);
                viewer.setDCase(new DCaseModel(tree, dcaseId, commitId));
            }
            return true;
        };
    }
    TimeLineView.prototype.repaint = function (dcase) {
        this.timeline.repaint(dcase);
    };
    return TimeLineView;
})();
