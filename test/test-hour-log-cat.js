/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */
var hourLogCat = require('../lib/hour-log-cat.js');
var nconf = require('nconf');
var winston = require('winston');

nconf.argv()
    .env()
    .defaults({ 'FILES_SYNC_ENV' : 'localhost' })
    .file({ file: 'config-'+nconf.get('FILES_SYNC_ENV')+'.json' });
logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp':true, 'level': nconf.get('logLevel')})
    ]
});

hourLogCat.catHourLogs(nconf.get("tasks")["daily-log-cat-and-cleanup"], logger, function() {logger.info("Test finished");});
