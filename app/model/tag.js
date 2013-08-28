var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');

var async = require('async');
var _ = require('underscore');

var Tag = (function () {
    function Tag(id, label, count) {
        this.id = id;
        this.label = label;
        this.count = count;
    }
    Tag.tableToObject = function (table) {
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
                _this.con.query('SELECT * FROM (SELECT t.id, t.label, COUNT(t.id) as cnt FROM tag t, dcase_tag_rel r, dcase d, commit c WHERE t.id = r.tag_id AND d.id = r.dcase_id AND d.id = c.dcase_id AND c.latest_flag = TRUE AND d.delete_flag = FALSE GROUP BY t.id, t.label) v ORDER BY v.cnt DESC', function (err, result) {
                    next(err, result);
                });
            },
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push(Tag.tableToObject(row));
                });
                next(null, list);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    TagDAO.prototype.search = function (userId, tagList, callback) {
        var _this = this;
        if (!tagList || tagList.length == 0) {
            this.list(callback);
            return;
        }
        async.waterfall([
            function (next) {
                var tagVars = _.map(tagList, function (tag) {
                    return '?';
                }).join(',');
                var sql = 'SELECT id, label, COUNT(id) as cnt FROM ( ' + 'SELECT t2.* ' + 'FROM dcase d, commit c, tag t, dcase_tag_rel r, dcase_tag_rel r2, tag t2, (SELECT DISTINCT p.* FROM project p, project_has_user pu WHERE p.id = pu.project_id AND p.delete_flag = FALSE AND (p.public_flag = TRUE OR pu.user_id = ?)) p ' + 'WHERE d.id = c.dcase_id  ' + 'AND t.id = r.tag_id   ' + 'AND r.dcase_id = d.id ' + 'AND r2.dcase_id = d.id ' + 'AND r2.tag_id = t2.id ' + 'AND p.id = d.project_id ' + 'AND c.latest_flag = TRUE  ' + 'AND d.delete_flag = FALSE  ' + 'AND t.label IN (' + tagVars + ') ' + 'GROUP BY c.id, t2.id ' + 'HAVING COUNT(t.id) = 2 ' + ') v ' + 'GROUP BY id ' + 'ORDER BY cnt DESC, id ';
                _this.con.query(sql, [userId].concat(tagList), function (err, result) {
                    next(err, result);
                });
            },
            function (result, next) {
                var list = [];
                result.forEach(function (row) {
                    list.push(Tag.tableToObject(row));
                });
                next(null, list);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    TagDAO.prototype.insert = function (label, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('INSERT INTO tag(label) VALUES(?)', [label], function (err, result) {
                    next(err, result);
                });
            }
        ], function (err, result) {
            callback(err, result.insertId);
        });
    };

    TagDAO.prototype.listDCaseTag = function (dcaseId, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT t.* FROM tag t, dcase_tag_rel r WHERE t.id = r.tag_id AND r.dcase_id=?', [dcaseId], function (err, result) {
                    next(err, result);
                });
            },
            function (result, next) {
                var list = _.map(result, function (row) {
                    return Tag.tableToObject(row);
                });
                next(null, list);
            }
        ], function (err, list) {
            callback(err, list);
        });
    };

    TagDAO.prototype.replaceDCaseTag = function (dcaseId, labelList, callback) {
        var _this = this;
        labelList = _.filter(_.map(labelList, function (label) {
            return label.trim();
        }), function (label) {
            return label.length > 0;
        });

        async.waterfall([
            function (next) {
                _this.listDCaseTag(dcaseId, function (err, list) {
                    return next(err, list);
                });
            },
            function (dbTagList, next) {
                var removeList = _.filter(dbTagList, function (dbTag) {
                    return !_.contains(labelList, dbTag.label);
                });
                var newList = _.filter(labelList, function (tag) {
                    return !_.find(dbTagList, function (dbTag) {
                        return dbTag.label == tag;
                    });
                });
                next(null, newList, removeList);
            },
            function (newList, removeList, next) {
                _this.insertDCaseTagList(dcaseId, newList, function (err) {
                    return next(err, removeList);
                });
            },
            function (removeList, next) {
                _this.removeDCaseTagList(dcaseId, removeList, function (err) {
                    return next(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    };

    TagDAO.prototype.insertDCaseTagList = function (dcaseId, tagList, callback) {
        var _this = this;
        if (!tagList || tagList.length == 0) {
            callback(null);
            return;
        }
        async.waterfall([
            function (next) {
                _this.insertDCaseTag(dcaseId, tagList[0], function (err) {
                    return next(err);
                });
            }
        ], function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this.insertDCaseTagList(dcaseId, tagList.slice(1), callback);
        });
    };
    TagDAO.prototype.insertDCaseTag = function (dcaseId, tag, callback) {
        var _this = this;
        tag = tag.trim();
        if (tag.length == 0) {
            callback(null);
            return;
        }
        async.waterfall([
            function (next) {
                _this.con.query('SELECT id FROM tag WHERE label=?', [tag], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result.length > 0) {
                    next(null, result[0].id);
                    return;
                }
                _this.insert(tag, function (err, tagId) {
                    return next(err, tagId);
                });
            },
            function (tagId, next) {
                _this.con.query('INSERT INTO dcase_tag_rel(dcase_id, tag_id) VALUES(?, ?)', [dcaseId, tagId], function (err, result) {
                    next(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    };
    TagDAO.prototype.removeDCaseTagList = function (dcaseId, tagList, callback) {
        var _this = this;
        if (!tagList || tagList.length == 0) {
            callback(null);
            return;
        }
        async.waterfall([
            function (next) {
                var tagIdList = _.map(tagList, function (tag) {
                    return tag.id;
                });
                var tagVars = _.map(tagIdList, function (id) {
                    return '?';
                }).join(',');
                var params = [].concat([dcaseId]).concat(tagIdList);
                _this.con.query('DELETE FROM dcase_tag_rel WHERE dcase_id=? AND tag_id in (' + tagVars + ')', params, function (err, result) {
                    return next(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    };
    return TagDAO;
})(model.DAO);
exports.TagDAO = TagDAO;

