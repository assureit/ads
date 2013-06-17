///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

class PropertyAdapter {
	constructor(public get: (key: string) => number, public set: (key: string, value: any) => void){}
}

class MoveTask {
	constructor (public key: string, public from: number, public to: number, public target: PropertyAdapter){}
}

class Animation {
	moveList: MoveTask[];
	fadeInList: MoveTask[];
	fadeOutList: MoveTask[];
	constructor() {
		this.moveList = [];
		this.fadeInList = [];
		this.fadeOutList = [];
	};

	private getAttrSetter(dom: HTMLElement);
	private getAttrSetter(dom: JQuery);
	private getAttrSetter(dom: any) {
		if(dom.setAttribute != null) {//FIXME?
			return new PropertyAdapter(
					(key: string) => { return dom.getAttribute(key); },
					(key: string, value: any) => { dom.setAttribute(key, value); }
			);
		} else if(dom.css != undefined){
			return new PropertyAdapter(
					(key: string) => { return dom.css(key); },
					(key: string, value: any) => { dom.css(key, value); }
			);
		} else {
			return new PropertyAdapter(
					(key: string) => { return dom[key]; },
					(key: string, value: any) => { dom[key] = value; }
			);
		}
	}

	public move(dom: any, key: string, toValue: number): any{
		var target: PropertyAdapter = this.getAttrSetter(dom);
		var fromValue: number = target.get(key);
		toValue = Math.floor(toValue);
		if(fromValue != toValue) {
			this.moveList.push(new MoveTask(
				key,
				fromValue,
				toValue,
				target
			));
		}
		return this;
	}
	public moves(dom: any, json: any) {
		for(var key in json) {
			this.move(dom, key, json[key]);
		}
		return this;
	};

	public movePolygon(dom: any, points: any): void {
		var from = [];
		for(var i=0; i<dom.points.numberOfItems; i++) {
			var p = dom.points.getItem(i);
			this.move(p, "x", points[i].x);
			this.move(p, "y", points[i].y);
		}
	};
	public show(dom: any, visible: bool): any {
		var target = this.getAttrSetter(dom);
		var disp = target.get("display");
		if(disp == null) {
			target.set("display", visible ? "block" : "none");
		} else if(disp == "none" && visible) {
			// fade in
			this.fadeInList.push(target);
			target.set("opacity", 0.0);
			target.set("display", "block");
		} else if(disp == "block" && !visible) {
			// fade out
			this.fadeOutList.push(target);
			target.set("opacity", 1.0);
			target.set("display", "block");
		}
		return this;
	};

	public anime(r: number): void {
		$.each(this.moveList, function(i, e) {
			e.target.set(e.key, e.from + (e.to - e.from) * r);
		});
		$.each(this.fadeInList, function(i, e) {
			e.set("opacity", r);
		});
		$.each(this.fadeOutList, function(i, e) {
			e.set("opacity", 1.0 - r);
		});
	};

	public animeFinish(): void {
		$.each(this.moveList, function(i: number, e: MoveTask) {
			e.target.set(e.key, e.to);
		});
		$.each(this.fadeInList, function(i: number, e: PropertyAdapter) {
			e.set("opacity", 1.0);
		});
		$.each(this.fadeOutList, function(i: number, e: PropertyAdapter) {
			e.set("opacity", 1.0);
			e.set("display", "none");
		});
	};
}
