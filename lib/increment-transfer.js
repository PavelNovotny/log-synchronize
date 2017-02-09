/**
 *
 * Created by pavelnovotny on 18.01.17.
 */

var Client = require('ssh2').Client;
var translateName = require('./translate-name');
var utils = require('./utils');
var fs = require('fs');
var async = require('async');
var nconf = require('nconf');

var logger;
module.exports.syncAll = syncAll;

function syncAll(nconf, setLogger, callback) {
    logger = setLogger;
    var transfers = nconf.get('transfers');
    async.eachSeries(transfers, function(transfer, callback) {
        transfer.files = createTransferFilesList(transfer);
        syncServer(transfer, callback);
    }, function(err) {
        if( err ) {
            logger.log('error', 'FAILED transfer');
        } else {
            logger.log('info', 'Transfer successful');
        }
        callback();
    });
}

function createTransferFilesList(transfer) {
    var files = [];
    var datum = utils.getDate(0);
    transfer.files.forEach(function (file) {
        files.push(file);
        for (var hour = 0; hour<24; hour++) {
            var hour = hour<10?'0'+hour:''+hour;
            var newFile = {};
            newFile.remoteFile = file.remoteFile + '.' + datum + '.' + hour;
            newFile.destFolder = file.destFolder;
            files.push(newFile);
            logger.log('debug', newFile.remoteFile);
        }
    });
    return files;
}


function syncServer(transfer, callback) {
    var conn = new Client();
    conn.on('ready', function() {
        logger.log('info','Downloading from server ' + transfer.server);
        downloadFiles(conn, transfer.files, callback);
    }).connect(getConnectionParams(transfer));
}

function getConnectionParams(transfer) {
    var params = {
        host: transfer.server,
            port: 22,
        username: transfer.username,
        passphrase: transfer.passphrase,
        privateKey: fs.readFileSync(transfer.privateKey)
    };
    if (transfer.passphrase === null) {
        delete params.passphrase;
    }
    return params;
}

function downloadFiles(conn, files, callback) {
    async.eachSeries(files, function(file, callback) {
        downloadFile(conn, file, callback);
    }, function(err) {
        conn.end();
        if( err ) {
            logger.log('error','FAILED');
            logger.log('error',err);
        } else {
            logger.log('info','Connection end');
            return callback();
        }
    });
}

function downloadFile(conn, file, callback) {
    logger.debug(file.remoteFile);
    var domain = utils.includes(file.remoteFile,'jms')?'jms':'other';
    var localFile = file.destFolder + '/' + translateName.translateEsbName(file.remoteFile, domain);
    conn.sftp(function(err, sftp) {
        if (err) return callback(err);
        var destReadStart= 0;
        if (fs.existsSync(localFile)) {
            var stats = fs.statSync(localFile);
            destReadStart = stats.size;
        }
        sftp.open(file.remoteFile,'r', function(err, fd) {
            if (err) {
                logger.log('debug',"Problem opening file " +file.remoteFile ); //logování pouze v případě problémů, normálně tam ty soubory nemusí být.
                logger.log('debug', err );
                sftp.end();
                return callback(null);
            }
            sftp.fstat(fd, function(err, stats) {
                logger.log('debug','remote size ' + stats.size + ' '+ file.remoteFile );
                var flagReplace = 'a';
                if (stats.size < destReadStart) { //zaciname znovu
                    flagReplace = 'w';
                    destReadStart = 0;
                } else if (stats.size === destReadStart) {
                    logger.log('debug',"Skipping file " +file.remoteFile );
                    sftp.end();
                    return callback(null);
                }
                logger.log('info','Processing file ' + file.remoteFile + " --> " + localFile);
                var readStream = sftp.createReadStream(file.remoteFile, {
                    start: destReadStart,
                    end: stats.size,
                    autoClose: true
                });
                var writeStream = fs.createWriteStream(localFile, {flags: flagReplace});
                readStream
                    .on('data', function (chunk) {
                        writeStream.write(chunk);
                    })
                    .on('end', function () {
                        logger.log('debug','All the data in the file has been read (on.end readstream)');
                        writeStream.end();

                    })
                    .on('close', function () {
                        logger.log('debug','Closed (on.close readstream)');
                        sftp.end();
                        return callback(null);
                    });
            });
        });
    });
}


