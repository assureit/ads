///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

class DCaseFile {
	constructor(public result: string, public name: string){}
}

class ImportFile {
	selector: string;

	constructor(selector: string) {
		this.selector = selector;
		$(this.selector).on('dragenter', (e)=> {
			e.stopPropagation();
			e.preventDefault();
		}).on('dragover', (e) => {
			e.stopPropagation();
			e.preventDefault();
			$(e.target).addClass('hover');
		}).on('dragleave', (e) => {
			e.stopPropagation();
			e.preventDefault();
			$(e.target).removeClass('hover');
		});
	}

	read(callback: (DCaseFile) => void): void{
		$(this.selector).on('drop', (e)=> {
			e.stopPropagation();
			e.preventDefault();
			$(e.target).removeClass('hover');
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

	upload(callback: (data: any, target: HTMLElement)=> void): void {
		$(this.selector).on('drop', (e) => {
			e.stopPropagation();
			e.preventDefault();
			$(e.target).removeClass('hover');
			var files: File[] = (<any>e.originalEvent.dataTransfer).files;

			var fd = new FormData();
			for (var i = 0; i < files.length; i++) {
				fd.append("upfile", files[i]);
			}

			$.ajax(<JQueryAjaxSettings>{
				url: Config.BASEPATH + '/file',
				type: 'POST',
				data: fd,
				processData: false,
				contentType: <any>false,
				success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
					callback(data, e.target);
				}
			});


			return false;
		});
	}
}
