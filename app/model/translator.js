var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');



var CONFIG = require('config');
var asn_parser = require('../util/asn-parser');
var mstranslator = require('../util/mstranslator/mstranslator');
var async = require('async');

var TranslateItem = (function () {
    function TranslateItem(model, statement) {
        this.model = model;
        this.statement = statement;
    }
    return TranslateItem;
})();
exports.TranslateItem = TranslateItem;

var TranslatorDAO = (function (_super) {
    __extends(TranslatorDAO, _super);
    function TranslatorDAO() {
        _super.apply(this, arguments);
    }
    TranslatorDAO.prototype.insert = function (model, items, callback) {
        var self = this;
        var Translator = new mstranslator({ client_id: CONFIG.translator.CLIENT_ID, client_secret: CONFIG.translator.CLIENT_SECRET });

        var SOURCE_TEXT_MAX_LENGTH = 1000;
        var items_fragment = [];
        var current_items = [];
        var statement_length = 0;
        items.forEach(function (i, index) {
            current_items.push(i);
            statement_length += i.statement.length;
            if (statement_length > SOURCE_TEXT_MAX_LENGTH) {
                items_fragment.push(current_items);
                current_items = [];
                statement_length = 0;
            }
        });
        if (current_items.length != 0) {
            items_fragment.push(current_items);
        }

        Translator.initialize_token(function (keys) {
            var texts = [];
            items.forEach(function (i) {
                texts.push(i.statement);
            });
            var param = {
                texts: texts,
                from: "ja",
                to: "en"
            };
            Translator.translateArray(param, function (err, data) {
                if (err) {
                    console.log('---- TRANSLATED FAILED ----');
                    console.log(err);
                    console.log(data);
                    callback(null, null);
                    return;
                }
                console.log('---- SUCCESSFULLY TRANSLATED ----');
                console.log(data);
                items.forEach(function (i, index) {
                    i.statement = data[index].TranslatedText;
                });

                async.each(items, function (i, callback) {
                    i.model.Notes['TranslatedTextEn'] = i.statement;
                    self._insert(i.model.Statement, i.statement, function (err, to_text) {
                        callback(err);
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    console.log('---- TRANSLATION END ----');
                    callback(null, model);
                    return;
                });
            });
        });
    };

    TranslatorDAO.prototype._insert = function (from_text, to_text, callback) {
        this.con.query('INSERT INTO translate(from_description, to_description) VALUES(?,?)', [from_text, to_text], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(err, to_text);
        });
    };

    TranslatorDAO.prototype.get = function (from_text, callback) {
        this.con.query('SELECT to_description FROM translate where from_description=?', [from_text], function (err, result) {
            if (err || result.length == 0) {
                callback(err, null);
                return;
            }
            callback(err, result[0].to_description);
        });
    };

    TranslatorDAO.prototype.translate = function (dcaseId, commitId, model, callback) {
        var _this = this;
        if (model == null || !CONFIG.translator || CONFIG.translator.CLIENT_ID.length == 0) {
            callback(null, null);
            return;
        }
        var models = [];
        var traverse = function (model) {
            if (model.Statement && model.Statement != '' && _this.CheckLength(model.Statement) && model.Notes['TranslatedTextEn'] == null) {
                models.push(model);
                for (var i in model.Children) {
                    if (model.Children[i] != '') {
                        traverse(model.Children[i]);
                    }
                }
            }
        };
        traverse(model);
        if (models.length == 0) {
            callback(null, null);
            return;
        }
        this.insertresult(model, models, callback);
    };

    TranslatorDAO.prototype.insertresult = function (model, models, callback) {
        var _this = this;
        var items = [];
        async.each(models, function (model, callback) {
            _this.get(model.Statement, function (err, to_text) {
                if (err) {
                    callback(null);
                    return;
                }
                if (to_text == null) {
                    var verified = model.Statement;
                    verified = verified.replace(/\r\n/g, '');
                    verified = verified.replace(/\n/g, '');
                    verified = verified.replace(/\t/g, '');
                    verified = verified.replace(/ /g, '');

                    if (verified[verified.length - 1] != '。') {
                        verified = verified.concat('。');
                    }

                    items.push(new TranslateItem(model, verified));
                } else {
                    console.log("Translation found on database.");
                    console.log(to_text);
                    model.Notes['TranslatedTextEn'] = to_text;
                }
                callback(null);
            });
        }, function (err) {
            if (items.length == 0) {
                console.log('---- TRANSLATION END ----');
                callback(null, model);
                return;
            }
            _this.insert(model, items, callback);
        });
    };

    TranslatorDAO.prototype.CheckLength = function (str) {
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (!((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4))) {
                return true;
            }
        }
        return false;
    };
    return TranslatorDAO;
})(model.DAO);
exports.TranslatorDAO = TranslatorDAO;

