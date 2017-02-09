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

cleanup.deleteHourBgzLogs('/Users/pavelnovotny/Downloads/transfer/hashseek/e2e_esb_predpr_logs', '20170208', logger);

