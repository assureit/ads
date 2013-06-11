import lang = module('./lang')

export var index = function(req: any, res: any) {
	//if(req.cookies.userId !== null) {
	//	res.render('signin', {title: 'Assurance DS', lang: lang.lang.ja });
	//}else {
	res.cookie('userId','1');
	res.cookie('userName','System');
	res.render('signout', {title: 'Assurance DS', lang: lang.lang.ja, userName: 'System' });
	//}
};
