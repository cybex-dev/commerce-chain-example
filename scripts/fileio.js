const _fs = require('fs');

/**
 * Save JSon Object to JSon file. JSon file extension can be omitted. The file can be appended i.e. the file will not be deleted and recreated.
 * @param filePath path to file
 * @param data data as json object
 * @param append false if file should be deleted and recreated.
 */
function saveJSonSync(filePath, data, append) {
    filePath = filePath + ".json";
    if (!append)
        if (_fs.existsSync(filePath))
            _fs.unlinkSync(filePath);
    _fs.writeFileSync(filePath, JSON.stringify(data));
}

module.exports = {
    saveJSonSync
};