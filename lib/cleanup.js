/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */
var fs = require('fs');
var utils = require('./utils.js');
var async = require('async');

module.exports.clean30ByteFiles = clean30ByteFiles;
module.exports.deleteFiles = deleteFiles;
module.exports.deleteFile = deleteFile;

function clean30ByteFiles(task, logger, callback) {
    var folders = task.folders;
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

function deleteFiles(files, logger, callback) {
    files.forEach(function(file) {
        deleteFile(file);
    });
    return callback();
}

function deleteFile(file) {
    if (fs.existsSync(file)) {
        logger.info('Deleting file ' + file);
        fs.unlinkSync(file);
    } else {
        logger.error('Can not delete. Does not exists ' + file);
    }
}
