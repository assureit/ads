

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
    });
});
