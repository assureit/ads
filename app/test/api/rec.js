

var rec = require('../../api/rec')


var expect = require('expect.js');
var express = require('express');
var server = express();
server.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send({
        result: 'OK'
    });
});
describe('api', function () {
    describe('rec', function () {
        before(function (done) {
            server.listen(3001).on('listening', done);
        });
        describe('getRawItemList', function () {
            it('call method', function (done) {
                rec.getRawItemList(null, {
                    onSuccess: function (result) {
                        console.log(result);
                        console.log('------------');
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
        });
        describe('getPresetList', function () {
            it('call method', function (done) {
                rec.getPresetList(null, {
                    onSuccess: function (result) {
                        console.log(result);
                        console.log('------------');
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
        });
    });
});
