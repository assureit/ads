var db = require('../db/db');


var model_user = require('../model/user');

var async = require('async');
var _ = require('underscore');
var CONFIG = require('config');

function getUserById(params, userId, callback) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);
    params = params || {};
    async.waterfall([
        function (next) {
            userDAO.select(params.userId, function (err, result) {
                return next(err, result);
            });
        }
    ], function (err, result) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess(result);
    });
}
exports.getUserById = getUserById;

function getUserByName(params, userId, callback) {
    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);
    params = params || {};
    async.waterfall([
        function (next) {
            userDAO.selectName(params.userName, function (err, result) {
                return next(err, result);
            });
        }
    ], function (err, result) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess(result);
    });
}
exports.getUserByName = getUserByName;

