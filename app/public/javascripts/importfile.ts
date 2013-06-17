///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

class ImportFile {

	constructor() {
		$("div.row").on('dragenter', e => {
			e.stopPropagation();
			e.preventDefault();
		}).on('dragover', e => {
			e.stopPropagation();
			e.preventDefault();
			$(this).addClass('hover');
		}).on('dragleave', e => {
			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
		});
	}

	read(callback): void{
		$("div.row").on('drop', e => {
			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
			var file = e.originalEvent.dataTransfer.files[0];
			if(file){
				var reader = new FileReader();
				reader.onerror = e => {
					console.log('error', (<any>e.target).error.code);
				}
				reader.onload = e => {
					callback({result: e.target.result, name: file.name});
				};
				reader.readAsText(file, 'utf-8');
			}
			return false;
		});
	};
}
