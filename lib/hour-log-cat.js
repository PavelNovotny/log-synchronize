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

var templates = [
    'jms_s1_alsb_aspect.audit.',
    'jms_s2_alsb_aspect.audit.',
    'other_s1_alsb_aspect.audit.',
    'other_s2_alsb_aspect.audit.'
];

function catHourLogs(nconf, setLogger) {
    logger = setLogger;
    logger.info('Running daily-log-cat.');
    var dailyLogCat = nconf.get('daily-log-cat');
    dailyLogCat.forEach(function(cat){
        // cat.sourceFolder
        // cat.targetFolder
        // cat.hourLog
        // cat.dailyLog
        //todo list sourceFolder for files with hourLog pattern, make list and then cat to dailyLog pattern and copy to targetFolder
        fs.readdir(cat.sourceFolder, function(err, files) {
            files.forEach(function(file) {
                var hourLogRegex = new RegExp(utils.prepareRegex(cat.hourLog));
                if (hourLogRegex.test(file)) {

                }
            });
        });
        // templates.forEach(function(template) {
        //     var dayFile = cat.hashSeekFolder+'/'+template+prevDate;
        //     var hourFiles = [];
        //     for (hour=0; hour<24; hour++) {
        //         var hourString = hour < 10?'.0'+hour:'.'+hour;
        //         var hourFile = cat.sourceFolder +'/'+template+prevDate+hourString;
        //         hourFiles.push(hourFile);
        //     }
        //     concatFiles(hourFiles, dayFile, function (){
        //         cleanup.deleteHourLogs(cat.sourceFolder, template+prevDate, logger);
        //         cleanup.deleteHourBgzLogs(cat.hashSeekFolder, template+prevDate, logger);
        //     });
        // });
    });

}

function concatFiles(fromFiles, toFile, callback) {
    logger.debug(toFile);
    if (fs.existsSync(toFile)) {
        logger.info('Deleted ' + toFile);
        fs.unlinkSync(toFile);
    }
    async.eachSeries(fromFiles, function(fromFile, callback) {
        if (fs.existsSync(fromFile)) {
            appendFile(toFile, fromFile, callback);
        } else {
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


