/**
 *
 * Created by pavelnovotny on 28.02.17.
 */

var async = require('async');
var utils = require('../lib/utils.js');
var nconf = require('nconf');
var fs = require('fs');
var winston = require('winston');
var remoteTransfer = require('../lib/remote-transfer.js');

nconf.argv()
    .env()
    .defaults({ 'FILES_SYNC_ENV' : 'pokusy' })
    .file({ file: 'config-'+nconf.get('FILES_SYNC_ENV')+'.json' });
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp':true, 'level': nconf.get('logLevel')})
    ]
});


var transfer = nconf.get('remote-transfer')[0];
//logger.info(transfer.folders[0].remoteFolder);

test();

function test() {
    remoteTransfer.filterFiles(transfer, logger, function() {
        transfer.files.forEach(function(file){
            file.localPaths.forEach(function(localPath){
                logger.info("Result: " + file.remotePath + '-->' + localPath);
            });
        });
        logger.info("Finished");
    });
}

