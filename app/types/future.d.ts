declare export class Future {
	static wrap(fn, idx?);
	static wait(/* ... */);
	get();
	return(value);
	throw(error);
	detach();
	isResolved();
	resolver();
	resolve(arg1, arg2);
	resolveSuccess(cb);
	proxy(future);
	proxyErrors(futures);
	wait();
}
