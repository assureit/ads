var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DCaseTheme = (function () {
    function DCaseTheme() {
        this.stroke = {
            "Goal": "none",
            "Context": "none",
            "Subject": "none",
            "Strategy": "none",
            "Evidence": "none",
            "Solution": "none",
            "Rebuttal": "none",
            "Monitor": "none"
        };
        this.fill = {
            "Goal": "#E0E0E0",
            "Context": "#C0C0C0",
            "Subject": "#C0C0C0",
            "Strategy": "#B0B0B0",
            "Evidence": "#D0D0D0",
            "Solution": "#D0D0D0",
            "Rebuttal": "#EEAAAA",
            "Monitor": "#D0D0D0"
        };
        this.selected = "#F08080";
        this.hovered = "#8080F0";
    }
    return DCaseTheme;
})();

var TiffanyblueTheme = (function (_super) {
    __extends(TiffanyblueTheme, _super);
    function TiffanyblueTheme() {
        _super.call(this);
        this.fill = {
            "Goal": "#b4d8df",
            "Context": "#dbf5f3",
            "Subject": "#dbf5f3",
            "Strategy": "#b4d8df",
            "Evidence": "#dbf5f3",
            "Solution": "#dbf5f3",
            "Rebuttal": "#eeaaaa",
            "Monitor": "#dbf5f3"
        };
    }
    return TiffanyblueTheme;
})(DCaseTheme);

var SimpleTheme = (function (_super) {
    __extends(SimpleTheme, _super);
    function SimpleTheme() {
        _super.call(this);
        this.fill = {
            "Goal": "#ffffff",
            "Context": "#ffffff",
            "Subject": "#ffffff",
            "Strategy": "#ffffff",
            "Evidence": "#ffffff",
            "Solution": "#ffffff",
            "Rebuttal": "#ffffff",
            "Monitor": "#ffffff"
        };
        this.stroke = {
            "Goal": "#000000",
            "Context": "#000000",
            "Subject": "#000000",
            "Strategy": "#000000",
            "Evidence": "#000000",
            "Solution": "#000000",
            "Rebuttal": "#000000",
            "Monitor": "#000000"
        };
    }
    return SimpleTheme;
})(DCaseTheme);

var ColorSets = (function () {
    function ColorSets(viewer) {
        this.viewer = viewer;
        this.ThemeSets = {
            "default": new DCaseTheme(),
            "Tiffanyblue": new TiffanyblueTheme(),
            "simple": new SimpleTheme()
        };
        this.colorTheme = this.ThemeSets.default;
        $("#menu-change-theme *").remove();
    }
    ColorSets.prototype.add = function (theme) {
    };

    ColorSets.prototype.get = function (name) {
        return this.ThemeSets[name];
    };

    ColorSets.prototype.createDropMenu = function () {
        var _this = this;
        var $ul = $("#menu-change-theme");
        $.each(this.ThemeSets, function (name, theme) {
            var sample = "";
            $.each(DCaseNodeModel.TYPES, function (i, type) {
                sample += "<span style=\"color: " + theme.fill[type] + ";\">■</span>";
            });
            var $li = $("<li></li>").html("<a href=\"#\">" + sample + name + "</a>").appendTo($ul);
            $li.click(function (e) {
                _this.viewer.setColorTheme(theme);
                e.preventDefault();
                document.cookie = "colorTheme=" + name;
            });
        });
    };
    return ColorSets;
})();
