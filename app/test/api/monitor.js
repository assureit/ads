
var db = require('../../db/db')
var monitor = require('../../api/monitor')
var error = require('../../api/error')
var expect = require('expect.js');
describe('api', function () {
    describe('monitor', function () {
        describe('modifyMonitorStatus', function () {
            var con = new db.Database();
            it('system node ID not existing is specified ', function (done) {
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: 99999,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'NG'
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).not.to.be(null);
                        expect(err instanceof error.NotFoundError).to.be(true);
                        done();
                    }
                });
            });
            it('dcaseId not existing is specified ', function (done) {
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: 1,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'NG'
                }, {
                    onSuccess: function (result) {
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).not.to.be(null);
                        expect(err instanceof error.NotFoundError).to.be(true);
                        done();
                    }
                });
            });
            it('status change OK->NG', function (done) {
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: 3,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'NG'
                }, {
                    onSuccess: function (result) {
                        con.query('select m.dcase_id, c.id, n.this_node_id, n.node_type from monitor_node m, commit c, node n where m.id = 3 and  m.dcase_id = c.dcase_id and c.latest_flag = TRUE AND c.id = n.commit_id and node_type = "Rebuttal";', function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(1).to.be(expectedResult.length);
                            done();
                        });
                    },
                    onFailure: function (err) {
                        console.log(err);
                        done();
                    }
                });
            });
            it('status change NG->OK', function (done) {
                monitor.modifyMonitorStatus({
                    evidenceId: 1,
                    systemNodeId: 3,
                    timestamp: '2013-06-26T12:30:30.999Z',
                    comment: 'Unit Test run',
                    status: 'OK'
                }, {
                    onSuccess: function (result) {
                        con.query('select m.dcase_id, c.id, n.this_node_id, n.node_type from monitor_node m, commit c, node n where m.id = 3 and  m.dcase_id = c.dcase_id and c.latest_flag = TRUE AND c.id = n.commit_id and node_type = "Rebuttal";', function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(0).to.be(expectedResult.length);
                            done();
                        });
                    },
                    onFailure: function (err) {
                        console.log(err);
                        done();
                    }
                });
            });
            con.close();
        });
    });
});
