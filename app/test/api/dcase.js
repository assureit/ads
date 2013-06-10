

var dcase = require('../../api/dcase')

describe('api', function () {
    describe('dcase', function () {
        describe('getDCaseList', function () {
            it('should return result', function (done) {
                dcase.getDCaseList(null, {
                    onSuccess: function (result) {
                        console.log(result);
                    },
                    onFailure: function (error) {
                    }
                });
                done();
            });
        });
        describe('createDCase', function () {
            it('should return result', function (done) {
                dcase.createDCase({
                    dcaseName: 'test dcase',
                    tree: null
                }, {
                    onSuccess: function (result) {
                        console.log(result);
                        done();
                    },
                    onFailure: function (error) {
                        console.log('err');
                        console.log(error);
                        done();
                    }
                });
            });
        });
    });
});
