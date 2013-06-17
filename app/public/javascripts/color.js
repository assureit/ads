var ColorSets = (function () {
    function ColorSets(viewer) {
        this.viewer = viewer;
        $("#menu-change-theme *").remove();
    }
    ColorSets.prototype.add = function (theme) {
    };
    ColorSets.prototype.get = function (name) {
        return this.Sets[name];
    };
    ColorSets.prototype.init = function () {
        this.Sets = {
            "default": this.viewer.default_colorTheme,
            "Tiffanyblue": this.viewer.default_colorTheme,
            "simple": this.viewer.default_colorTheme
        };
        this.Sets["Tiffanyblue"].fill = {
            "Goal": "#b4d8df",
            "Context": "#dbf5f3",
            "Subject": "#dbf5f3",
            "Strategy": "#b4d8df",
            "Evidence": "#dbf5f3",
            "Solution": "#dbf5f3",
            "Rebuttal": "#eeaaaa"
        };
        this.Sets["simple"].fill = {
            "Goal": "#ffffff",
            "Context": "#ffffff",
            "Subject": "#ffffff",
            "Strategy": "#ffffff",
            "Evidence": "#ffffff",
            "Solution": "#ffffff",
            "Rebuttal": "#ffffff"
        };
        this.Sets["simple"].stroke = {
            "Goal": "#000000",
            "Context": "#000000",
            "Subject": "#000000",
            "Strategy": "#000000",
            "Evidence": "#000000",
            "Solution": "#000000",
            "Rebuttal": "#000000"
        };
    };
    ColorSets.prototype.createDropMenu = function () {
        var _this = this;
        var $ul = $("#menu-change-theme");
        $.each(this.Sets, function (name, theme) {
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
