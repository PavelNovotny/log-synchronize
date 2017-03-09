/**
 *
 * Created by pavelnovotny on 06.02.17.
 */

var remoteTransfer = require('./remote-transfer.js');
var localTransfer = require('./local-transfer.js');
var hourLogCat = require('./hour-log-cat.js');
var cleanup = require('./cleanup.js');
var nconf = require('nconf');
var winston = require('winston');

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
    logger.info('Started scheduled transfer');
    remoteTransfer.syncAll(nconf, logger, function() {
        var downloadInterval = nconf.get("schedule-interval");
        logger.info('Download interval '+ downloadInterval+' sec');
        if (downloadInterval === undefined) {
            logger.error('Cannot get download-interval property');
            return;
        }
        //cleanup.clean30ByteFiles(nconf, logger);
        //hourLogCat.catHourLogs(nconf, logger);
        //localTransfer.copyHourLogToIndex(nconf, logger);

        setTimeout(process, 1000 * downloadInterval);
    });
}







