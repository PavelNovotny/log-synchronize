/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */
var fs = require('fs');
var utils = require('./utils.js');

module.exports.clean30ByteFiles = clean30ByteFiles;
module.exports.deleteHourLogs = deleteHourLogs;
module.exports.deleteHourBgzLogs = deleteHourBgzLogs;

var hour = 0;

function clean30ByteFiles(nconf, logger) {
    var date = new Date();
    var currentHour = date.getHours();
    if (currentHour === hour) {
        return;
    }
    hour = currentHour;
    logger.info('Cleanup 30 byte .bgz');
    var folders = nconf.get('local-transfer');
    folders.forEach(function(folder) {
        var hashSeekFolder = folder.hashSeekFolder;
        fs.readdir(hashSeekFolder, function(err, files) {
            if (err) return logger.error(err);
            files.forEach(function(file) {
                if (utils.endsWith(file,'.bgz')) {
                    var filePath = hashSeekFolder+'/'+file;
                    var stats = fs.statSync(filePath);
                    var size = stats["size"];
                    if (size === 30) {
                        logger.info('Deleting file ' + filePath);
                        fs.unlinkSync(filePath);
                    }
                }
            });
        });

    });
}

function deleteHourLogs(folder, basicPattern, logger) {
    logger.info('Deleting hour logs');
    fs.readdir(folder, function(err, files) {
        if (err) return logger.error(err);
        files.forEach(function(file) {
            var regex = new RegExp(basicPattern + '\\.\\d\\d$','g');
            var match = file.match(regex);
            if(match != null) {
                var filePath = folder + '/' + file;
                logger.info('Deleting hour file ' + filePath);
                fs.unlinkSync(filePath);
            }
        });
    });
}

function deleteHourBgzLogs(folder, basicPattern, logger) {
    logger.info('Deleting hour bgz logs')
    fs.readdir(folder, function(err, files) {
        if (err) return logger.error(err);
        files.forEach(function(file) {
            var regex = new RegExp(basicPattern + '\\.\\d\\d\\.bgz$','g');
            var match = file.match(regex);
            if(match != null) {
                var filePath = folder + '/' + file;
                logger.info('Deleting hour file ' + filePath);
                fs.unlinkSync(filePath);
            }
        });
    });
}
