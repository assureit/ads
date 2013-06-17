///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

class DCaseFile {
	constructor(public result: string, public name: string){}
}

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

	read(callback: DCaseFile): void{
		$("div.row").on('drop', e => {
			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
			var file: File = (<any>e.originalEvent.dataTransfer).files[0];
			if(file) {
				var reader = new FileReader();
				reader.onerror = (e) => {
					console.log('error', (<any>e.target).error.code);
				}
				reader.onload = (e) => {
					var dcaseFile = new DCaseFile((<any>e.target).result, file.name);
					callback(dcaseFile);
				};
				reader.readAsText(file, 'utf-8');
			}
			return false;
		});
	};
}
