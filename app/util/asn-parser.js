var peg = require('./../public/assurejs/lib/ASNParser/peg');

var ASNParser = (function () {
    function ASNParser() {
    }
    ASNParser.prototype.parseNodeList = function (asn) {
        var obj = peg.parse(asn)[1];
        var node = [];
        var traverse = function (n) {
            var children = n.Children;
            n.Children = [];
            node.push(n);
            children.forEach(function (c) {
                traverse(c);
            });
        };
        traverse(obj);
        return node;
    };
    return ASNParser;
})();
exports.ASNParser = ASNParser;

