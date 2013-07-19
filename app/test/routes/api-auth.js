var assert = require('assert')

var app = require('../../app')
var error = require('../../api/error')
var request = require('supertest');
var expect = require('expect.js');
describe('routes.api', function () {
    describe('createDCase', function () {
        it('require auth', function () {
            request(app['app']).post('/api/1.0').send({
                "jsonrpc": "2.0",
                "method": "createDCase",
                "id": 100,
                "params": {
                }
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
            });
        });
    });
    describe('commit', function () {
        it('require auth', function () {
            request(app['app']).post('/api/1.0').send({
                "jsonrpc": "2.0",
                "method": "commit",
                "id": 100,
                "params": {
                }
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
            });
        });
    });
    describe('deleteDCase', function () {
        it('require auth', function () {
            request(app['app']).post('/api/1.0').send({
                "jsonrpc": "2.0",
                "method": "deleteDCase",
                "id": 100,
                "params": {
                }
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
            });
        });
    });
    describe('editDCase', function () {
        it('require auth', function () {
            request(app['app']).post('/api/1.0').send({
                "jsonrpc": "2.0",
                "method": "editDCase",
                "id": 100,
                "params": {
                }
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                expect(res.body.error.code).to.eql(error.RPC_ERROR.AUTH_ERROR);
            });
        });
    });
});
