
var db = require('../../db/db');
var monitor = require('../../api/monitor');
var error = require('../../api/error');
var constant = require('../../constant');
var testdata = require('../testdata');

var expect = require('expect.js');
var CONFIG = require('config');

var responseOK = true;
var redmineCall = true;
var redmineRequestBody;

var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    if (responseOK) {
        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: 1 }));
    } else {
        res.send(JSON.stringify({ jsonrpc: "2.0", id: 1 }), 500);
    }
});
app.post('/issues.json', function (req, res) {
    res.header('Content-Type', 'application/json');
    if (req.body.issue.project_id == CONFIG.redmine.projectId) {
        redmineRequestBody = req.body;
        res.send(JSON.stringify({ "issue": { "id": 3825 } }));
    } else {
        res.send(JSON.stringify({ jsonrpc: "2.0", id: 1 }), 500);
    }
});

app.put('/issues/:itsId', function (req, res) {
    redmineCall = true;
    redmineRequestBody = req.body;
    res.send(200);
});

var userId = constant.SYSTEM_USER_ID;

describe('api', function () {
    var con;
    var validParams;

    beforeEach(function (done) {
        testdata.load(['test/default-data.yaml', 'test/api/monitor.yaml'], function (err) {
            con = new db.Database();
            validParams = {
                evidenceId: 1,
                systemNodeId: 1,
                timestamp: '2013-06-26T12:30:30.999Z',
                comment: 'Unit Test Run',
                status: 'OK'
            };
            responseOK = true;
            redmineCall = false;
            redmineRequestBody = null;
            done();
        });
    });
    afterEach(function (done) {
        testdata.clear(function (err) {
            return done();
        });
    });
    describe('monitor', function () {
        var server = null;
        before(function (done) {
            CONFIG.redmine.port = 3030;
            server = app.listen(3030).on('listening', done);
        });

        after(function () {
            server.close();
            CONFIG.redmine.port = CONFIG.getOriginalConfig().redmine.port;
            CONFIG.resetRuntime(function (err, written, buffer) {
            });
        });

        describe('modifyMonitorStatus', function () {
            it('system node ID not existing is specified ', function (done) {
                validParams.systemNodeId = 99999;
                validParams.status = 'NG';
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
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
                validParams.systemNodeId = 603;
                validParams.status = 'NG';

                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [validParams.systemNodeId], function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(1).to.be(expectedResult.length);
                            expect(redmineRequestBody).not.to.be(null);
                            expect(redmineRequestBody.issue.subject).to.eql(constant.REBUTTAL_SUBJECT);
                            expect(redmineRequestBody.issue.description).to.eql(constant.REBUTTAL_DESCRIPTION + '\r\n' + validParams.comment);
                            done();
                        });
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('status change NG->OK', function (done) {
                validParams.systemNodeId = 1001;
                validParams.status = 'OK';
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [validParams.systemNodeId], function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(0).to.be(expectedResult.length);
                            expect(redmineRequestBody).not.to.be(null);
                            expect(redmineRequestBody.issue.notes).to.eql(validParams.comment);
                            done();
                        });
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('prams is null', function (done) {
                monitor.modifyMonitorStatus(null, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nParameter is required.');
                        done();
                    }
                });
            });
            it('Evidence ID is not set', function (done) {
                delete validParams['evidenceId'];
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nEvidence ID is required.');
                        done();
                    }
                });
            });
            it('Evidence ID is not a number', function (done) {
                validParams.evidenceId = 'a';
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nEvidence ID must be a number.');
                        done();
                    }
                });
            });
            it('System Node ID is not set', function (done) {
                delete validParams['systemNodeId'];
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nSystem Node ID is required.');
                        done();
                    }
                });
            });
            it('System Node ID is not a number', function (done) {
                validParams.systemNodeId = 'a';
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nSystem Node ID must be a number.');
                        done();
                    }
                });
            });
            it('Timestamp is not set', function (done) {
                delete validParams['timestamp'];
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nTimestamp is required.');
                        done();
                    }
                });
            });
            it('Comment is not set', function (done) {
                delete validParams['comment'];
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nComment is required.');
                        done();
                    }
                });
            });
            it('Status is not set', function (done) {
                delete validParams['status'];
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nStatus is required.');
                        done();
                    }
                });
            });
            it('Status is not OK or NG', function (done) {
                validParams.status = 'AA';
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err.rpcHttpStatus).to.be(200);
                        expect(err.code).to.be(error.RPC_ERROR.INVALID_PARAMS);
                        expect(err.message).to.be('Invalid method parameter is found: \nStatus is OK or NG.');
                        done();
                    }
                });
            });
            it('Effective Node is Nothing', function (done) {
                validParams.systemNodeId = 605;
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('Effective DCase is Nothing', function (done) {
                validParams.systemNodeId = 606;
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).to.be(null);
                        done();
                    }
                });
            });
            it('It is not connectable with rec. ', function (done) {
                validParams.systemNodeId = 603;
                validParams.status = 'NG';
                responseOK = false;
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        done();
                    },
                    onFailure: function (err) {
                        expect(err).not.to.be(null);
                        con.query('SELECT m.dcase_id, c.id, n.this_node_id, n.node_type FROM monitor_node m, commit c, node n WHERE m.id = ? AND  m.dcase_id = c.dcase_id AND c.latest_flag = TRUE AND c.id = n.commit_id AND node_type = "Rebuttal"', [validParams.systemNodeId], function (err, expectedResult) {
                            expect(err).to.be(null);
                            expect(0).to.be(expectedResult.length);
                            done();
                        });
                    }
                });
            });
            it('Since issueId could not be acquired, redmine was not able to be called. ', function (done) {
                validParams.systemNodeId = 1002;
                validParams.status = 'OK';
                monitor.modifyMonitorStatus(validParams, userId, {
                    onSuccess: function (result) {
                        expect(result).to.be(null);
                        expect(redmineCall).to.be(false);
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

