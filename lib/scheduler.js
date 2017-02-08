/**
 *
 * Created by pavelnovotny on 06.02.17.
 */

var incrementTransfer = require('./increment-transfer.js');
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
    incrementTransfer.syncAll(nconf, logger, function() {
        var downloadInterval = nconf.get("download-interval");
        logger.info('Download interval '+ downloadInterval+' sec');
        if (downloadInterval === undefined) {
            logger.error('Cannot get download-interval property');
            return;
        }
        cleanup.clean30ByteFiles(nconf, logger);

        //todo transfer hodinových do indexovacího adresáře
        //todo cat hodinových a transfer denního do indexovacího adresáře
        //todo čistit 30bytové soubory
        //todo čistit hodinové soubory
        //todo přenést i poslední hodinový soubor z předchozího dne

        setTimeout(process, 1000 * downloadInterval);
    });
}







