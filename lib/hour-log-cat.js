/**
 *
 * Created by pavelnovotny on 06.02.17.
 */
var fs = require('fs');
var utils = require('./utils.js');
var async = require('async');
var cleanup = require('./cleanup.js');

var logger;

module.exports.catHourLogs = catHourLogs;

function catHourLogs(nconf, setLogger, callback) {
    logger = setLogger;
    logger.info('Running daily-log-cat.');
    var dailyLogCat = nconf.get('daily-log-cat');
    async.each(dailyLogCat, function(cat, callback) {
        fs.readdir(cat.sourceFolder, function(err, files) {
            if (err) return callback(err);
            var sourceFiles=[],bgzDataFiles=[],hashFiles=[],indHashFiles=[],indDataFiles=[],blockDataFiles=[];
            var hourLogRegex = new RegExp(utils.prepareRegex(cat.hourLog));
            files.forEach(function(file) {
                if (hourLogRegex.test(file)) {
                    sourceFiles.push(file);
                    bgzDataFiles.push(cat.targetFolder + file +'.bgz');
                    hashFiles.push(cat.indexFolder + file +'.bgz.hash_v1.bgz');
                    indHashFiles.push(cat.indexFolder + file +'.bgz.hash_v1.bgz.ind');
                    indDataFiles.push(cat.indexFolder + file +'.bgz.ind');
                    blockDataFiles.push(cat.indexFolder + file +'.blocks');
                }
            });
            if (sourceFiles.length === 0) return callback();
            var dayFile = cat.targetFolder + sourceFiles[0].replace(hourLogRegex, cat.dailyLog); //musí být jednoznačný název denního logu v rámci pole
            sourceFiles.forEach(function(file, index, sortedFiles) {
                sortedFiles[index] = cat.sourceFolder + file;
            });
            sourceFiles.sort();
            concatFiles(sourceFiles, dayFile, function() {
                cleanup.deleteFiles(sourceFiles, logger);
                cleanup.deleteFiles(bgzDataFiles, logger);
                cleanup.deleteFiles(hashFiles, logger);
                cleanup.deleteFiles(indHashFiles, logger);
                cleanup.deleteFiles(indDataFiles, logger);
                cleanup.deleteFiles(blockDataFiles, logger);
            });
            callback();
        });
    }, function(err) {
        return callback(err);
    });
}

function concatFiles(fromFiles, toFile, callback) {
    logger.debug(toFile);
    if (fs.existsSync(toFile)) {
        logger.error('File ' + toFile + ' already exists.');
        return callback();
    }
    async.eachSeries(fromFiles, function(fromFile, callback) {
        if (fs.existsSync(fromFile)) {
            appendFile(toFile, fromFile, callback);
        } else {
            logger.error('File ' + fromFile + ' does not exists.');
            callback();
        }
    }, function(err) {
        if( err ) {
            logger.error('FAILED');
            logger.error(err);
        } else {
            logger.info('Concat finished ' + toFile);
            callback();
        }
    });
}


function appendFile(destFile, appendedFile, callback) {
    var write = fs.createWriteStream(destFile, {flags: 'a'});
    var read = fs.createReadStream(appendedFile);
    write.on('close', function() {
        logger.info("Appended " + appendedFile + ' --> ' + destFile);
        return callback();
    });
    read.pipe(write);
}


