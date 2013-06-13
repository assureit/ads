var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model')
var User = (function () {
    function User(id, loginName, deleteFlag, systemFlag) {
        this.id = id;
        this.loginName = loginName;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
    }
    return User;
})();
exports.User = User;
var UserDAO = (function (_super) {
    __extends(UserDAO, _super);
    function UserDAO() {
        _super.apply(this, arguments);

    }
    return UserDAO;
})(model.DAO);
exports.UserDAO = UserDAO;
