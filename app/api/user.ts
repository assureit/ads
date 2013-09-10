///<reference path='../DefinitelyTyped/async/async.d.ts'/>

import db = module('../db/db')
import type = module('./type')
import constant = module('../constant')
import model_user = module('../model/user')
import error = module('./error')
var async = require('async')
var _ = require('underscore');
var CONFIG = require('config');

export function getUserById(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	params = params || {};
	async.waterfall([
		(next) => {
			userDAO.select(params.userId,(err:any, result: model_user.User) => next(err, result));
		}],
		(err:any, result:model_user.User) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			callback.onSuccess(result);
		}
	);
}

export function getUserByName(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	var userDAO = new model_user.UserDAO(con);
	params = params || {};
	async.waterfall([
		(next) => {
			userDAO.selectName(params.userName,(err:any, result: model_user.User) => next(err, result));
		}],
		(err:any, result:model_user.User) => {
			con.close();
			if (err) {
				callback.onFailure(err);
				return;
			}
			callback.onSuccess(result);
		}
	);
}