var User = (function () {
    function User(name, deleteFlag, systemFlag) {
        this.name = name;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
    }
    return User;
})();
exports.User = User;
