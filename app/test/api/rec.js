

var rec = require('../../api/rec')

var expect = require('expect.js');
describe('api', function () {
    describe('rec', function () {
        describe('getRawItemList', function () {
            it('', function (done) {
                rec.getRawItemList(null, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (err) {
                        done();
                    }
                });
            });
        });
        describe('getPresetList', function () {
            it('', function (done) {
                rec.getPresetList(null, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (err) {
                        done();
                    }
                });
            });
        });
    });
});
