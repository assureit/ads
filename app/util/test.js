(function (str) {
    function random(length) {
        var seed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var str = '';
        for(var i = 0; i < length; i++) {
            str += seed.charAt(Math.floor(Math.random() * seed.length));
        }
        return str;
    }
    str.random = random;
})(exports.str || (exports.str = {}));
var str = exports.str;
