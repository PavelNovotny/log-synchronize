/**
 *
 * Created by pavelnovotny on 06.02.17.
 */
var fs = require('fs');
var utils = require('./utils.js');
var async = require('async');

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
    var date = new Date();
    var run = date.getHours()===0; //po půlnoci
    if (true) {
        var prevDate = utils.getDate(-1);
        var destFolders = [];
        nconf.get('transfers').forEach(function(transfer) {
            transfer.files.forEach(function(file) {
                destFolders.push(file.destFolder);
            });
        });
        var uniqueDestFolders = destFolders.filter(function(elem, pos) {
            return destFolders.indexOf(elem) == pos;
        });
        uniqueDestFolders.forEach(function(destFolder){
            templates.forEach(function(template) {
                var dayFile = destFolder+'/'+template+prevDate;
                var hourFiles = [];
                for (hour=0; hour<24; hour++) {
                    var hourString = hour < 10?'.0'+hour:'.'+hour;
                    var hourFile = destFolder +'/'+template+prevDate+hourString;
                    hourFiles.push(hourFile);
                }
                concatFiles(hourFiles, dayFile);
            });
        });

    }
}

function concatFiles(fromFiles, toFile) {
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


