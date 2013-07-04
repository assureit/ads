class SideMenu {
	model: SideMenuModel;
	view: SideMenuView;

	constructor(isEdit?: bool) {
		this.model = new SideMenuModel();
		this.view = new SideMenuView(this.model);
	}


}

interface ISideMenuItem {
	label: string;
	href: string;
}

class SideMenuSubItem implements ISideMenuItem {
	constructor(public label: string, public href: string, public parentItem: SideMenuItem) {
	}
}

class SideMenuItem implements ISideMenuItem {
	constructor(public label: string, public href: string) {
	}
}

class SideMenuModel {
	items: SideMenuItem[];

	constructor() {
	}

	addItem(menuItem:SideMenuItem) {
		this.items.push(menuItem);
	}
}

class SideMenuView {
	constructor(public model: SideMenuModel) {
		var menu: JQuery = $("#drop-menu");

		$('#menu-button').click((e) => {
			if(!menu.hasClass("clicked")) {
				menu.addClass("clicked");
			}else {
				menu.removeClass("clicked");
			};
		});
	}

	update() {
	}

}
