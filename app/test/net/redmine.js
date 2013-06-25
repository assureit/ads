
var redmine = require('../../net/redmine')
describe('net', function () {
    describe('redmine', function () {
        var issue = new redmine.Issue();
        describe('createSimple', function () {
            it('should create new issue', function (done) {
                issue.createSimple('test', 'contents', function (err, result) {
                    console.log(err);
                    console.log(result);
                    done();
                });
            });
        });
    });
});
