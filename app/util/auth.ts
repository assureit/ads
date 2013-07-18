export class Auth {
	constructor(public req: any, public res: any) {}
	isLogin(): bool {
		return !!this.req.signedCookies.sessionUserId;
	}

	set(userId:number, loginName:string): void {
		this.res.cookie('userId',userId);
		this.res.cookie('userName',loginName);
		this.res.cookie('sessionUserId',userId, {signed: true});
		this.res.cookie('sessionUserName',loginName, {signed: true});
	}

	getLoginName(): string {
		return this.req.signedCookies.sessionUserName;
	}

	getUserId(): number {
		if (this.req.signedCookies.sessionUserId) return parseInt(this.req.signedCookies.sessionUserId, 10);
		return undefined;
	}

	clear(): void {
		this.res.clearCookie('userId');
		this.res.clearCookie('userName');
		this.res.clearCookie('sessionUserId');
		this.res.clearCookie('sessionUserName');
	}
}