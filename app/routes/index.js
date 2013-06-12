var lang = require('./lang')
exports.index = function (req, res) {
    res.cookie('userId', '1');
    res.cookie('userName', 'System');
    var params = {
        title: 'Assurance DS',
        lang: lang.lang.ja,
        userName: 'System'
    };
    if(req.cookies.lang == 'en') {
        params.lang = lang.lang.en;
    }
    res.render('signout', params);
};
