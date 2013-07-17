
var testdata = require('../testdata')
var expect = require('expect.js');
var exec = require('child_process').exec;
describe('job', function () {
    beforeEach(function (done) {
        testdata.load([
            'test/default-data.yaml'
        ], function (err) {
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('monitor', function () {
        describe('cleanMonitor', function () {
            it('Run ', function (done) {
                var cmd = 'npm run-script clean_monitor';
                exec(cmd, function (err, stdout, stderr) {
                    console.log('err=' + err);
                    console.log("stdout=" + stdout);
                    console.log("stderr=" + stderr);
                    expect(err).to.be(null);
                    done();
                });
            });
        });
    });
});
