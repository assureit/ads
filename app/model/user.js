var User = (function () {
    function User(id, name, deleteFlag, systemFlag) {
        this.id = id;
        this.name = name;
        this.deleteFlag = deleteFlag;
        this.systemFlag = systemFlag;
    }
    return User;
})();
exports.User = User;
