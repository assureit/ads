var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var events = require('events');

var DAO = (function (_super) {
    __extends(DAO, _super);
    function DAO(con) {
        _super.call(this);
        this.con = con;
    }
    return DAO;
})(events.EventEmitter);
exports.DAO = DAO;

