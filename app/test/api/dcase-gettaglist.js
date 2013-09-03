

var dcase = require('../../api/dcase');

var constant = require('../../constant');
var testdata = require('../testdata');


var expect = require('expect.js');

var userId = constant.SYSTEM_USER_ID;

describe('api.dcase', function () {
    var con;

    beforeEach(function (done) {
        testdata.load(['test/api/dcase-gettaglist.yaml'], function (err) {
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });

    describe('getTagList', function () {
        it('should return result', function (done) {
            dcase.getTagList({}, userId, {
                onSuccess: function (result) {
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.tagList).not.to.be(null);
                    expect(result.tagList).not.to.be(undefined);
                    expect(result.tagList).to.be.an('array');
                    expect(result.tagList.length > 0).to.equal(true);
                    var checkDic = {};
                    result.tagList.forEach(function (it) {
                        expect(it).to.be.an('string');
                        expect(it).not.to.equal('deleted_tag');
                        expect(it).not.to.equal('unlink_tag');
                        expect(checkDic[it]).to.be(undefined);
                        checkDic[it] = it;
                    });
                    done();
                },
                onFailure: function (error) {
                    expect().fail(JSON.stringify(error));
                    done();
                }
            });
        });
    });
});

