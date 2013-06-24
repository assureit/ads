import path = module('path')
import fs = module('fs')

export function mkdirpSync(dirPath: string, mode?:string) : void  {
	var pathList = dirPath.split(path.sep);
	var created = '';
	if (pathList.length == 0) return;
	if (pathList[0] == '') created = '/';	// Absolute path's first element is ''
	pathList.forEach((p: string) => {
		created = path.join(created, p);
		if (!fs.existsSync(created)) {
			fs.mkdirSync(created, mode);
		}
	});
}
