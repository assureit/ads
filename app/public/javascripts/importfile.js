var DCaseFile = (function () {
    function DCaseFile(result, name) {
        this.result = result;
        this.name = name;
    }
    return DCaseFile;
})();

var ImportFile = (function () {
    function ImportFile(selector) {
        var _this = this;
        this.selector = selector;
        $(this.selector).on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
        }).on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(_this.selector).addClass('hover');
        }).on('dragleave', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(_this.selector).removeClass('hover');
        });
    }
    ImportFile.prototype.read = function (callback) {
        $(this.selector).on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.target).removeClass('hover');
            var file = (e.originalEvent.dataTransfer).files[0];
            if (file) {
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

    ImportFile.prototype.upload = function (callback) {
        $(this.selector).on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.target).removeClass('hover');
            var files = (e.originalEvent.dataTransfer).files;

            var fd = new FormData();
            for (var i = 0; i < files.length; i++) {
                fd.append("upfile", files[i]);
            }

            $.ajax({
                url: Config.BASEPATH + '/file',
                type: 'POST',
                data: fd,
                processData: false,
                contentType: false,
                success: function (data, textStatus, jqXHR) {
                    callback(data, e.target);
                }
            });

            return false;
        });
    };
    return ImportFile;
})();
