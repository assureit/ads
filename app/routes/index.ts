import lang = module('./lang')

export var index = function(req: any, res: any) {
	if(req.cookies.userId !== null) {
		res.render('signin', {title: 'Assurance DS', lang: lang.lang.ja });
	}else {
		res.render('signout', {title: 'Assurance DS', lang: lang.lang.ja });
	}
};
