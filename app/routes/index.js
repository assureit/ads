var lang = require('./lang')
exports.index = function (req, res) {
    if(req.cookies.userId !== null) {
        res.render('signin', {
            title: 'Assurance DS',
            lang: lang.lang.ja
        });
    } else {
        res.render('signout', {
            title: 'Assurance DS',
            lang: lang.lang.ja
        });
    }
};
