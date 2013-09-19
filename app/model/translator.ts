import model = module('./model')
import domain = module('domain')
import error = module('../api/error')
import redmine = module('../net/redmine')
var CONFIG = require('config');
var asn_parser = require('../util/asn-parser');
var mstranslator = require('../util/mstranslator/mstranslator');

export class TranslatorDAO extends model.DAO {
	insert(from_text: string, to_text: string, callback: (err: any, result: string) => void) {
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
			if (err) {
				callback(err, null);
				return;
			}
			console.log(result);
			callback(err, null);
		});
	}

	translate(dcaseId:number, commitId: number, model: any, callback: (err:any, asn: string)=> void): void {
		if (model == null || !CONFIG.translator || CONFIG.translator.CLIENT_ID.length == 0) {
			callback(null, null);
			return;
		}
		var Translator = new mstranslator({client_id: CONFIG.translator.CLIENT_ID, client_secret: CONFIG.translator.CLIENT_SECRET});
		var items = [[], []];
		var traverse = (model) => {
			if (model.Statement && model.Statement != '' && this.CheckLength(model.Statement) && model.Notes['TranslatedTextEn'] == null) {
				model.Statement = model.Statement.replace(/\r\n/g, '');
				model.Statement = model.Statement.replace(/\n/g, '');
				model.Statement = model.Statement.replace(/\t/g, '');
				model.Statement = model.Statement.replace(/ /g, '');
				items[0].push(model);
				items[1].push(model.Statement);
			}
			for (var i in model.Children) {
				if (model.Children[i] != '') {
					traverse(model.Children[i]);
				}
			}
		}
		traverse(model);
		if (items[0].length == 0) {
			callback(null, null);
			return;
		}

		Translator.initialize_token(function(keys) {
			var param = {
				texts: items[1],
				from: "ja",
				to: "en"
			};
			Translator.translateArray(param, function(err, data) {
				if (err) {
					console.log('---- TRANSLATED FAILED ----')
					console.log(param);
					console.log(err);
					console.log(data);
					callback(null, null);
					return;
				}
				console.log(items);
				for (var i in items[0]) {
					var model_translated = items[0][i];
					model_translated.Notes['TranslatedTextEn'] = data[i]['TranslatedText'];
				}
				var parser = new asn_parser.ASNParser();
				var asn = parser.ConvertToASN(model, false);
				console.log('---- SUCCESSFULLY TRANSLATED ----')
				console.log(asn);
				callback(null, asn);
				return;
			});
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
