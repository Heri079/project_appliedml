let utils = {};

utils.createFileFromUrl = function(path, url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        if (request.readyState === 4 && request.status === 200) {
            let data = new Uint8Array(request.response);
            cv.FS_createDataFile('/', path, data, true, false, false);
            callback();
        } else {
            console.error('Failed to load ' + url + ' status: ' + request.status);
        }
    };
    request.send();
};