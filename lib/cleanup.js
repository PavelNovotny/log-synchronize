/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */
var fs = require('fs');
var utils = require('./utils.js');
var async = require('async');

module.exports.clean30ByteFiles = clean30ByteFiles;
module.exports.deleteHourLogs = deleteHourLogs;
module.exports.deleteHourBgzLogs = deleteHourBgzLogs;

function clean30ByteFiles(nconf, logger, callback) {
    logger.info('Cleanup 30 byte .bgz');
    var folders = nconf.get('cleanup-30bytes-bgz');
    async.each(folders, function(folder, callback) {
        fs.readdir(folder, function(err, files) {
            if (err) return callback(err);
            files.forEach(function(file) {
                if (utils.endsWith(file,'.bgz')) {
                    var filePath = folder+file;
                    var stats = fs.statSync(filePath);
                    var size = stats["size"];
                    if (size === 30) {
                        logger.info('Deleting file ' + filePath);
                        fs.unlinkSync(filePath);
                    }
                }
            });
            return callback();
        });
    }, function(err) {
         return callback(err);
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
