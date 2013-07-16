var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')

var async = require('async');
var Tag = (function () {
    function Tag(id, label, count) {
        this.id = id;
        this.label = label;
        this.count = count;
    }
    Tag.tableToObject = function tableToObject(table) {
        return new Tag(table.id, table.label, table.cnt ? table.cnt : 0);
    };
    return Tag;
})();
exports.Tag = Tag;
var TagDAO = (function (_super) {
    __extends(TagDAO, _super);
    function TagDAO() {
        _super.apply(this, arguments);

    }
    TagDAO.prototype.list = function (callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM (SELECT t.id, t.label, COUNT(t.id) as cnt FROM tag t, dcase_tag_rel r, dcase d WHERE t.id = r.tag_id AND d.id = r.dcase_id AND d.delete_flag = FALSE GROUP BY t.id, t.label) v ORDER BY v.cnt DESC', function (err, result) {
                    next(err, result);
                });
            }, 
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push(Tag.tableToObject(row));
                });
                next(null, list);
            }        ], function (err, list) {
            callback(err, list);
        });
    };
    return TagDAO;
})(model.DAO);
exports.TagDAO = TagDAO;
