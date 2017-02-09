/**
 *
 * Created by pavelnovotny on 09.02.17.
 */

module.exports.copyHourLogToIndex = copyHourLogToIndex;

function copyHourLogToIndex(nconf, logger) {
    logger.info('copying hour log to index folder ');
    return;
    //todo implement
    var folders = nconf.get('local-transfer');
    folders.forEach(function (folder) {
        var hashSeekFolder = folder.hashSeekFolder;
        var sourceFolder = folder.sourceFolder;
        fs.readdir(sourceFolder, function (err, files) {
            if (err) return logger.error(err);
            files.forEach(function (file) {
                var match = file.match(/\.\d\d\.bgz$/);
                if (match != null) {
                    var filePath = hashSeekFolder + '/' + file;
                    logger.info('Deleting hour bgz file ' + filePath);
                    //todo odkomentovat
                    //fs.unlinkSync(filePath);
                }
            });
        });
    });
}

