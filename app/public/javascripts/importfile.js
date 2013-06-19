var DCaseFile = (function () {
    function DCaseFile(result, name) {
        this.result = result;
        this.name = name;
    }
    return DCaseFile;
})();
var ImportFile = (function () {
    function ImportFile() {
        var _this = this;
        this.ase = "#ase";
        $(this.ase).on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
        }).on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(_this.ase).addClass('hover');
        }).on('dragleave', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(_this.ase).removeClass('hover');
        });
    }
    ImportFile.prototype.read = function (callback) {
        var _this = this;
        $("#ase").on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(_this.ase).removeClass('hover');
            var file = (e.originalEvent.dataTransfer).files[0];
            if(file) {
                var reader = new FileReader();
                reader.onerror = function (e) {
                    console.log('error', (e.target).error.code);
                };
                reader.onload = function (e) {
                    var dcaseFile = new DCaseFile((e.target).result, file.name);
                    callback(dcaseFile);
                };
                reader.readAsText(file, 'utf-8');
            }
            return false;
        });
    };
    return ImportFile;
})();
