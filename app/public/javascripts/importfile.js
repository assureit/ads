var ImportFile = (function(){

	function ImportFile() {
		$("div.row").on('dragenter', function (e) {
			e.stopPropagation();
			e.preventDefault();
		}).on('dragover', function (e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).addClass('hover');
		}).on('dragleave', function (e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
		});
	}

	ImportFile.prototype.read = function(callback) {
		$("div.row").on('drop', function (e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
			var file = e.originalEvent.dataTransfer.files[0];
			if(file) {
				var reader = new FileReader();
				reader.onerror = function(e) {
					console.log('error', e.target.error.code);
				}
				reader.onload = function(e){
					callback({result: e.target.result, name: file.name});
				};
				reader.readAsText(file, 'utf-8');
			}
			return false;
		});
	};

	return ImportFile;
})();
