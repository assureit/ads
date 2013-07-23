var CONFIG = require('config');

exports.config = function (req, res) {
    var params = { basepath: CONFIG.ads.basePath };
    res.set('Content-type', 'text/javascript');
    res.render('javascript/config', params);
};

