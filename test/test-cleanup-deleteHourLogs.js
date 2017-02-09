/**
 *
 * Created by pavelnovotny on 08.02.17.
 */

var cleanup = require('../lib/cleanup.js');
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

cleanup.deleteHourLogs('/Users/pavelnovotny/Downloads/transfer/legacy', '20170208',  logger);

