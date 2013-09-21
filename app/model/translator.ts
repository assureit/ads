import model = module('./model')
import domain = module('domain')
import error = module('../api/error')
import redmine = module('../net/redmine')
var CONFIG = require('config');
var asn_parser = require('../util/asn-parser');
var mstranslator = require('../util/mstranslator/mstranslator');
var async = require('async');

export class TranslateItem {
	constructor(public model: any, public statement: string) {}
}

export class TranslatorDAO extends model.DAO {

	insert (model: any, items: TranslateItem[], callback: (err: any, _model: string)=>void) {
		var self = this;
		var Translator = new mstranslator({client_id: CONFIG.translator.CLIENT_ID, client_secret: CONFIG.translator.CLIENT_SECRET});

		/* split items into acceptable size */
		var SOURCE_TEXT_MAX_LENGTH = 1000;
		var items_fragment: TranslateItem[][] = [];
		var current_items: TranslateItem[] = [];
		var statement_length: number = 0;
		items.forEach((i: TranslateItem, index) => {
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

		//async.each(items_fragment,(items:

		Translator.initialize_token(function (keys) {
			var texts = [];
			items.forEach((i: TranslateItem) => {
				texts.push(i.statement);
			});
			var param = {
				texts: texts,
				from: "ja",
				to: "en"
			};
			Translator.translateArray(param, function (err, data) {
				if (err) {
					console.log('---- TRANSLATED FAILED ----')
					console.log(err);
					console.log(data);
					callback(null, null);
					return;
				}
				console.log('---- SUCCESSFULLY TRANSLATED ----')
				console.log(data);
				items.forEach((i: TranslateItem, index) => {
					i.statement = data[index].TranslatedText;
				});

				async.each(items,(i: TranslateItem,callback:(err: any)=>void)=> {
					i.model.Notes['TranslatedTextEn'] = i.statement;
					self._insert(i.model.Statement, i.statement, (err: any, to_text: string) => {
						callback(err);
					});
				}, (err) => {
					if (err) {
						callback(err, null);
						return;
					}
					console.log('---- TRANSLATION END ----')
					callback(null, model);
					return;
				});
			});
		});
	}

	_insert(from_text: string, to_text: string, callback: (err: any, result: string) => void) {
		this.con.query('INSERT INTO translate(from_description, to_description) VALUES(?,?)', [from_text, to_text], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(err, to_text);
		});
	}

	get(from_text: string, callback: (err: any, to_text: string) => void): void {
		this.con.query('SELECT to_description FROM translate where from_description=?', [from_text], (err, result) => {
			if (err || result.length == 0) {
				callback(err, null);
				return;
			}
			callback(err, result[0].to_description);
		});
	}

	translate(dcaseId:number, commitId: number, model: any, callback: (err:any, asn: string)=> void): void {
		if (model == null || !CONFIG.translator || CONFIG.translator.CLIENT_ID.length == 0) {
			callback(null, null);
			return;
		}
		var models: any[] = [];
		var traverse = (model) => {
			if (model.Statement && model.Statement != '' && this.CheckLength(model.Statement) && model.Notes['TranslatedTextEn'] == null) {
				models.push(model);
				for (var i in model.Children) {
					if (model.Children[i] != '') {
						traverse(model.Children[i]);
					}
				}
			}
		}
		traverse(model);
		if (models.length == 0) {
			callback(null, null);
			return;
		}
		this.insertresult(model, models, callback);
	}

	insertresult(model: any, models: any[], callback: (err: any, _model: string)=>void) {
		var items: TranslateItem[] = [];
		async.each(models, (model: any, callback:(err: any)=>void) => {
			this.get(model.Statement, (err: any, to_text: string) => {
				if (err) {
					callback(null);
					return;
				}
				if (to_text == null) {
					var verified: string = model.Statement;
					verified = verified.replace(/\r\n/g, '');
					verified = verified.replace(/\n/g, '');
					verified = verified.replace(/\t/g, '');
					verified = verified.replace(/ /g, '');

					/* It's a bit ad-hoc but surely effective. */
					if (verified[verified.length-1] != '。') {
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
		}, (err: any) => {
			if (items.length == 0) {
				console.log('---- TRANSLATION END ----')
				callback(null, model);
				return;
			}
			this.insert(model, items, callback);
		});
	}

	CheckLength(str: string) {
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			if ( !((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4))) {
				return true;
			}
		}
		return false;
	}
}
