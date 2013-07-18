var assert = require('assert')

var app = require('../../app')



var request = require('supertest');
var async = require('async');
var CONFIG = require('config');

describe('route', function () {
    var con;
    afterEach(function (done) {
        CONFIG.rec.monitorUrl = CONFIG.getOriginalConfig().rec.monitorUrl;
        CONFIG.resetRuntime(function (err, written, buffer) {
            done();
        });
    });
    describe('monitor', function () {
        it('should return HTTP200 return URL ', function (done) {
            this.timeout(15000);
            request(app['app']).get('/monitor/55').expect(302).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.notStrictEqual(undefined, res.text);
                assert.notStrictEqual(null, res.text);
                assert.notEqual('', res.text);
                done();
            });
        });
        it('Config error', function (done) {
            CONFIG.rec.monitorUrl = '';
            request(app['app']).get('/monitor/55').expect(500).expect('rec.monitorUrl is not set.').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
        it('ID is not a number', function (done) {
            request(app['app']).get('/monitor/aaa').expect(400).expect('Id must be a number.').end(function (err, res) {
                if(err) {
                    throw err;
                }
                done();
            });
        });
    });
});
