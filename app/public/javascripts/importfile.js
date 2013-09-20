var DCaseFile = (function () {
    function DCaseFile(result, name) {
        this.result = result;
        this.name = name;
    }
    return DCaseFile;
})();

var ImportFile = (function () {
    function ImportFile(selector) {
        this.selector = selector;
        var flag = true;
        $(this.selector).on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (flag) {
            }
        }).on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).addClass('hover');
            $(e.currentTarget).addClass('panel-info');
            $(e.currentTarget).removeClass('panel-default');
        }).on('dragleave', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).removeClass('hover');
            $(e.currentTarget).addClass('panel-default');
            $(e.currentTarget).removeClass('panel-info');
            flag = true;
        });
    }
    ImportFile.prototype.read = function (callback) {
        $(this.selector).on('drop', function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            $(ev.currentTarget).removeClass('hover');
            var file = (ev.originalEvent.dataTransfer).files[0];
            if (file) {
                var reader = new FileReader();
                reader.onerror = function (e) {
                    console.log('error', (e.target).error.code);
                };
                reader.onload = function (e) {
                    var dcaseFile = new DCaseFile((e.target).result, file.name);
                    callback(dcaseFile, ev.currentTarget);
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
