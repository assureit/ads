var path = require('path')
var fs = require('fs')
function mkdirpSync(dirPath, mode) {
    var pathList = dirPath.split(path.sep);
    var created = '';
    if(pathList.length == 0) {
        return;
    }
    if(pathList[0] == '') {
        created = '/';
    }
    pathList.forEach(function (p) {
        created = path.join(created, p);
        if(!fs.existsSync(created)) {
            fs.mkdirSync(created, mode);
        }
    });
}
exports.mkdirpSync = mkdirpSync;
