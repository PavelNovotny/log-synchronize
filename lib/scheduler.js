/**
 *
 * Created by pavelnovotny on 06.02.17.
 */

var incrementTransfer = require('./increment-transfer.js');
var nconf = require('nconf');
var winston = require('winston');

transfer();

function transfer() {
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
    incrementTransfer.syncAll(nconf, logger, function() {
        var downloadInterval = nconf.get("download-interval");
        logger.info('Download interval '+ downloadInterval+' sec');
        if (downloadInterval === undefined) {
            logger.error('Cannot get download-interval property');
            return;
        }
        setTimeout(transfer, 1000 * downloadInterval);
    });
}



