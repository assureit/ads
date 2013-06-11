var lang = require('./lang')
exports.index = function (req, res) {
    res.cookie('userId', '1');
    res.cookie('userName', 'System');
    res.render('signout', {
        title: 'Assurance DS',
        lang: lang.lang.ja,
        userName: 'System'
    });
};
