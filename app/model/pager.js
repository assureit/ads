var Pager = (function () {
    function Pager(current) {
        this.current = current;
        this.limit = 20;
        this.current = current || 1;
        this.current = this.current - 1;
        if(this.current < 0) {
            this.current = 0;
        }
    }
    Pager.prototype.getMaxPage = function () {
        this.totalItems = this.totalItems || 0;
        return Math.ceil(this.totalItems / this.limit);
    };
    Pager.prototype.getOffset = function () {
        return this.current * this.limit;
    };
    return Pager;
})();
exports.Pager = Pager;
