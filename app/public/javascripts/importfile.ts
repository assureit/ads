///<reference path='../../DefinitelyTyped/jquery/jquery.d.ts'/>

class DCaseFile {
	constructor(public result: string, public name: string){}
}

class ImportFile {
	selector: string;

	constructor(selector: string) {
		this.selector = selector;
		var flag = true;
		$(this.selector).on('dragenter', (e)=> {
			e.stopPropagation();
			e.preventDefault();
			if(flag) {
//				var left = Number($(e.currentTarget).css('margin-left').replace("px","")) - 10;
//				$(e.currentTarget).css({'margin-left': left + 'px'});
			}
		}).on('dragover', (e) => {
			e.stopPropagation();
			e.preventDefault();
			$(e.currentTarget).addClass('hover');
		}).on('dragleave', (e) => {
			e.stopPropagation();
			e.preventDefault();
			$(e.currentTarget).removeClass('hover');
			flag = true;
//			var left = Number($(e.currentTarget).css('margin-left').replace("px","")) + 10;
//			$(e.currentTarget).css({'margin-left': left + 'px'});
		});
	}

	read(callback: (DCaseFile, target: any) => void): void{
		$(this.selector).on('drop', (ev)=> {
			ev.stopPropagation();
			ev.preventDefault();
			$(ev.currentTarget).removeClass('hover');
			var file: File = (<any>ev.originalEvent.dataTransfer).files[0];
			if(file) {
				var reader = new FileReader();
				reader.onerror = (e) => {
					console.log('error', (<any>e.target).error.code);
				}
				reader.onload = (e) => {
					var dcaseFile = new DCaseFile((<any>e.target).result, file.name);
					callback(dcaseFile, ev.currentTarget);
				};
				reader.readAsText(file, 'utf-8');
			}
			return false;
		});
	}

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
