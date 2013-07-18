
var model_file = require('../../model/file')

var testdata = require('../testdata')
var expect = require('expect.js');
describe('model', function () {
    var testDB;
    var con;
    var fileDAO;
    beforeEach(function (done) {
        testdata.begin([
            'test/default-data.yaml'
        ], function (err, c) {
            con = c;
            fileDAO = new model_file.FileDAO(con);
            done();
        });
    });
    afterEach(function (done) {
        con.rollback(function (err, result) {
            con.close();
            if(err) {
                throw err;
            }
            done();
        });
    });
    describe('file', function () {
        describe('insert', function () {
            it('normal end', function (done) {
                fileDAO.insert('filename', 1, function (err, fileId) {
                    expect(err).to.be(null);
                    expect(fileId).not.to.be(null);
                    con.query('SELECT * FROM file WHERE id=?', [
                        fileId
                    ], function (err, result) {
                        expect(err).to.be(null);
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result[0].id).to.be(fileId);
                        expect(result[0].name).to.eql('filename');
                        expect(result[0].user_id).to.eql(1);
                        done();
                    });
                });
            });
            it('user id is not exist', function (done) {
                fileDAO.insert('filename', 99999, function (err, fileId) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
        });
        describe('update', function () {
            it('normal end', function (done) {
                fileDAO.update(301, 'update test', function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM file WHERE id=301', function (err, result) {
                        expect(err).to.be(null);
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result[0].path).to.eql('update test');
                        done();
                    });
                });
            });
        });
        describe('select', function () {
            it('normal end', function (done) {
                fileDAO.select(301, function (err, path, name) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM file WHERE id=301', function (err, result) {
                        expect(err).to.be(null);
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(result[0].path).to.eql(path);
                        expect(result[0].name).to.eql(name);
                        done();
                    });
                });
            });
        });
        describe('get', function () {
            it('normal end', function (done) {
                fileDAO.get(301, function (err, file) {
                    expect(err).to.be(null);
                    expect(file).not.to.be(null);
                    expect(file).not.to.be(undefined);
                    con.query('SELECT * FROM file WHERE id=301', function (err, result) {
                        expect(err).to.be(null);
                        expect(result).not.to.be(null);
                        expect(result).not.to.be(undefined);
                        expect(file.id).to.eql(result[0].id);
                        expect(file.name).to.eql(result[0].name);
                        expect(file.path).to.eql(result[0].path);
                        expect(file.userId).to.eql(result[0].user_id);
                        done();
                    });
                });
            });
        });
    });
});
