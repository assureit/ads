export class Auth {
	constructor(public req: any, public res: any) {}
	isLogin(): bool {
		return this.req.session.userId != null;
	}

	set(userId:number, userName:string): void {
		this.req.session.userId = userId;
		this.req.session.userName = userName;
	}

	getLoginName(): string {
		return this.req.session.userName;
	}

	getUserId(): number {
		if (this.req.session.userId) return parseInt(this.req.session.sessionId, 10);
		return undefined;
	}

	clear(): void {
		delete this.req.session.userId;
		delete this.req.session.userName;
	}
}
