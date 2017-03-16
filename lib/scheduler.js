/**
 *
 * Created by pavelnovotny on 06.02.17.
 */

var remoteTransfer = require('./remote-transfer.js');
var localTransfer = require('./local-transfer.js');
var hourLogCat = require('./hour-log-cat.js');
var cleanup = require('./cleanup.js');
var nconf = require('nconf');
var utils = require('./utils.js');
var winston = require('winston');
var async = require('async');

process();

function process() {
    nconf.argv()
        .env()
        .defaults({ 'FILES_SYNC_ENV' : 'localhost' })
        .file({ file: 'config-'+nconf.get('FILES_SYNC_ENV')+'.json' });
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({'timestamp':true, 'level': nconf.get('logLevel')})
        ]
    });
    var downloadInterval;
    async.series([
            function(callback) {
                downloadInterval = nconf.get("schedule-interval");
                if (downloadInterval === undefined) {
                    callback('Cannot get download-interval property');
                }
                logger.info('Started scheduled transfer');
                callback();
            },
            function(callback) {
                remoteTransfer.syncAll(nconf, logger, callback);
            },
            function(callback) {
                clean30ByteFiles(nconf, logger, callback);
            },
            function(callback) {
                catHourLogs(nconf, logger, callback);
            }
        ],
        function(err) {
            if (err) return logger.error(err);
            setTimeout(process, 1000 * downloadInterval);
            logger.info('Waiting for '+ downloadInterval+' sec');
        });

}

var runClean30ByteFiles = 0;
function clean30ByteFiles(nconf, logger, callback) {
    var date = new Date();
    var currentHour = date.getHours();
    if (currentHour != runClean30ByteFiles) { //každou hodinu
        runClean30ByteFiles = currentHour;
        cleanup.clean30ByteFiles(nconf, logger, callback);
    } else {
        return callback();
    }
}

var runCatHourLogs = null;
function catHourLogs(nconf, logger, callback) {
    var date = new Date();
    var prevDate = utils.getDate(-1);
    if (date.getHours()===1 &&(runCatHourLogs === null || runCatHourLogs === prevDate)) {//hodinu po půlnoci
        runCatHourLogs = utils.getDate(0);
        hourLogCat.catHourLogs(nconf, logger, callback);
    } else {
        return callback();
    }
}






