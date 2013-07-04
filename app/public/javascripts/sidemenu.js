var SideMenu = (function () {
    function SideMenu(isEdit) {
        this.model = new SideMenuModel();
        this.view = new SideMenuView(this.model);
    }
    return SideMenu;
})();
var SideMenuSubItem = (function () {
    function SideMenuSubItem(label, href, parentItem) {
        this.label = label;
        this.href = href;
        this.parentItem = parentItem;
    }
    return SideMenuSubItem;
})();
var SideMenuItem = (function () {
    function SideMenuItem(label, href) {
        this.label = label;
        this.href = href;
    }
    return SideMenuItem;
})();
var SideMenuModel = (function () {
    function SideMenuModel() {
    }
    SideMenuModel.prototype.addItem = function (menuItem) {
        this.items.push(menuItem);
    };
    return SideMenuModel;
})();
var SideMenuView = (function () {
    function SideMenuView(model) {
        this.model = model;
        var menu = $("#drop-menu");
        $('#menu-button').click(function (e) {
            if(!menu.hasClass("clicked")) {
                menu.addClass("clicked");
            } else {
                menu.removeClass("clicked");
            }
            ;
        });
    }
    SideMenuView.prototype.update = function () {
    };
    return SideMenuView;
})();
