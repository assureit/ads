declare module 'js-yaml' {
	function scan(stream:any, callback:Function, Loader:any) : void;
	function compose(stream:any, Loader:any) : any;
	function load(stream:any, Loader:any) : any;
	function loadAll(stream:any, callback:Function, Loader:any) : void;
	function load(stream:any) : any;
	function loadAll(stream:any, callback:Function) : void;
	function addConstructor(tag:any, constructor:Function, Loader:any) : void;
}
