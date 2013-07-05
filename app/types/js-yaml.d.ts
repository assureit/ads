declare module 'js-yaml' {
	declare function scan(stream:any, callback:Function, Loader:any) : void;
	declare function compose(stream:any, Loader:any) : any;
	declare function load(stream:any, Loader:any) : any;
	declare function loadAll(stream:any, callback:Function, Loader:any) : void;
	declare function load(stream:any) : any;
	declare function loadAll(stream:any, callback:Function) : void;
	declare function addConstructor(tag:any, constructor:Function, Loader:any) : void;
}
