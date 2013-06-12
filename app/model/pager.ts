export class Pager {
	public totalItems: number;
	public limit: number = 20;
	constructor(public current: number) {
		this.current = current || 1;
		this.current = this.current -1;
		if (this.current < 0) this.current = 0;
	}

	getMaxPage(): number {
		this.totalItems = this.totalItems || 0;
		return Math.ceil(this.totalItems / this.limit);
	}

	/**
	 * for JSON-RPC.
	 * current page 1 means offset 0
	 */
	getCurrentPage(): number {
		return this.current + 1;
	}

	getOffset(): number {
		return this.current * this.limit;
	}
}