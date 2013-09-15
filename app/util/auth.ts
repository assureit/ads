export class Auth {
	constructor(public req: any, public res: any) {}
	isLogin(): bool {
		return this.req.session.userId != null;
	}

	set(userId:number, userName:string): void {
		this.res.cookie('userId', userId);
		this.res.cookie('userName', userName);
		this.res.cookie('sessionUserId', userId, { signed: true });
		this.res.cookie('sessionUserName', userName, { signed: true }); 
		this.req.session.userId = userId;
		this.req.session.userName = userName;
	}

	getLoginName(): string {
		return this.req.session.userName;
	}

	getUserId(): number {
		if (this.req.session.userId) return parseInt(this.req.session.userId, 10);
		return undefined;
	}

	clear(): void {
		this.res.clearCookie('userId');
		this.res.clearCookie('userName');
		this.res.clearCookie('sessionUserId');
		this.res.clearCookie('sessionUserName'); 
		delete this.req.session.userId;
		delete this.req.session.userName;
	}
}
