

var rec = require('../../api/rec')


var constant = require('../../constant')
var userId = constant.SYSTEM_USER_ID;
var expect = require('expect.js');
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send(req.body);
});
describe('api', function () {
    describe('rec', function () {
        before(function (done) {
            app.listen(3030).on('listening', done);
        });
        describe('getRawItemList', function () {
            it('call method', function (done) {
                rec.getRawItemList(null, userId, {
                    onSuccess: function (result) {
                        expect(result.method).to.eql('getRawItemList');
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
                rec.getPresetList(null, userId, {
                    onSuccess: function (result) {
                        expect(result.method).to.eql('getPresetList');
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
