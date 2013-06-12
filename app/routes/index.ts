import lang = module('./lang')

export var index = function(req: any, res: any) {
	//if(req.cookies.userId !== null) {
	//	res.render('signin', {title: 'Assurance DS', lang: lang.lang.ja });
	//}else {
	res.cookie('userId','1');
	res.cookie('userName','System');
	var params = {title: 'Assurance DS', lang: lang.lang.ja, userName: 'System' };
	if( req.cookies.lang == 'en') {
		params.lang = lang.lang.en;
	}
	res.render('signout', params);
	//}
};
