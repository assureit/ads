import model = module('./model')
import domain = module('domain')
import error = module('../api/error')
import redmine = module('../net/redmine')
var CONFIG = require('config');
var asn_parser = require('../util/asn-parser');
var mstranslator = require('../util/mstranslator/mstranslator');

export class TranslatorDAO extends model.DAO {
	translate(dcaseId:number, commitId: number, model: any, callback: (err:any, asn: string)=> void): void {
		if (model == null || !CONFIG.translator || CONFIG.translator.CLIENT_ID.length == 0) {
			callback(null, null);
			return;
		}
		var CheckLength = function (str) {
			for (var i = 0; i < str.length; i++) {
				var c = str.charCodeAt(i);
				if ( !((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4))) {
					return true;
				}
			}
			return false;
		};
		var Translator = new mstranslator({client_id: CONFIG.translator.CLIENT_ID, client_secret: CONFIG.translator.CLIENT_SECRET});
		var items = [[], []];
		var traverse = (model) => {
			if (model.Statement && model.Statement != '' && CheckLength(model.Statement) && model.Notes['TranslatedTextEn'] == null) {
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

}
