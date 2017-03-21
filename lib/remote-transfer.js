/**
 *
 * Created by pavelnovotny on 18.01.17.
 */

var Client = require('ssh2').Client;
var utils = require('./utils');
var cleanup = require('./cleanup');
var fs = require('fs');
var async = require('async');
var nconf = require('nconf');

var logger;
module.exports.syncAll = syncAll;
module.exports.filterFiles = filterFiles1;

function syncAll(task, setLogger, callback) {
    logger = setLogger;
    var transfers = task.servers;
    async.eachSeries(transfers, function(transfer, callback) {
        filterFiles(transfer, function(err) {
            if (err) return callback(err);
            syncServer(transfer, callback);
        });
    }, function(err) {
        if( err ) {
            logger.log('error', 'FAILED transfer');
        } else {
            logger.log('info', 'Transfer successful');
        }
        callback();
    });
}

function filterFiles(transfer, callback) {
    filterFiles1(transfer, logger, callback);
}

function filterFiles1(transfer, logger, callback) {
    transfer.files=[];
    var conn = new Client();
    conn.on('ready', function() {
        logger.debug('Filtering files from server ' + transfer.server);
        conn.sftp(function(err, sftp) {
            async.eachSeries(transfer.folders, function(folder, callback) {
                logger.debug('Filtering files ' + transfer.server + ' ' + folder.remoteFolder);
                sftp.readdir(folder.remoteFolder, function(err, list) {
                    logger.debug('Folder read ' + folder.remoteFolder);
                    if (err) return callback(err);
                    folder.fileNames.forEach(function(fileName) {
                        var remoteRegex = new RegExp(utils.prepareRegex(fileName.remote));
                        list.forEach(function(item){
                            if (remoteRegex.test(item.filename)) {
                                var localName = item.filename.replace(remoteRegex, fileName.local);
                                var remotePath = folder.remoteFolder + item.filename;
                                var copyTest = item.filename.replace(remoteRegex, fileName.local+'.bgz');
                                var localPaths = [];
                                for (i=0;i<folder.localFolders.length;i++) {
                                    var localFolder = folder.localFolders[i];
                                    var localPath = localFolder + localName;
                                    var testLocalPath = localFolder + copyTest;
                                    if (fs.existsSync(testLocalPath)) {
                                        logger.debug("File " + testLocalPath + " exists. No need to transfer.");
                                    } else {
                                        var localSize = 0;
                                        if (fs.existsSync(localPath)) {
                                            var stats = fs.statSync(localPath);
                                            localSize = stats.size;
                                        }
                                        if (localSize === item.attrs.size) {
                                            logger.debug("File " + testLocalPath + " has the same size "+ localSize + ". No need to transfer.");
                                        } else {
                                            logger.debug(remotePath + '-->' + localPath);
                                            localPaths.push(localPath);
                                        }
                                    }
                                }
                                if (localPaths.length !=0) {
                                    transfer.files.push({
                                        "remotePath":remotePath,
                                        "localPaths":localPaths
                                    });
                                }
                            }
                        });
                    });
                    logger.debug('Folder read end ' + folder.remoteFolder);
                    callback();
                });
            }, function(err) {
                conn.end();
                if( err ) {
                    logger.error('FAILED filterFiles');
                    logger.error(err);
                } else {
                    logger.debug('Connection end filter files '+ transfer.server);
                    return callback();
                }
            });
        });
    }).connect(utils.getConnectionParams(transfer, nconf.get("logLevel") === "debug"));
}


function syncServer(transfer, callback) {
    var conn = new Client();
    conn.on('ready', function() {
        logger.log('info','Downloading from server ' + transfer.server);
        downloadFiles(conn, transfer, callback);
    }).connect(utils.getConnectionParams(transfer, nconf.get("logLevel") === "debug"));
}


function downloadFiles(conn, transfer, callback) {
    async.eachSeries(transfer.files, function(file, callback) {
        downloadFile(conn, file, callback);
    }, function(err) {
        conn.end();
        if( err ) {
            logger.error('FAILED');
            logger.error(err);
        } else {
            logger.info('Connection end ' + transfer.server);
            return callback();
        }
    });
}

function checkLocalSizes(file) {
    var destReadStart= 0;
    if (fs.existsSync(file.localPaths[0])) {
        var stats = fs.statSync(file.localPaths[0]);
        destReadStart = stats.size;
    }
    for (i=1; i<file.localPaths.length; i++) {
        if (fs.existsSync(file.localPaths[i])) {
            var stats = fs.statSync(file.localPaths[i]);
            if (destReadStart != stats.size) {
                logger.error("Size of "+file.localPaths[i] + " NOT EQUAL " + file.localPaths[i-1]);
                return false;
            }
        }
    }
    return true;
}

function downloadFile(conn, file, callback) {
    logger.debug(file.remotePath);
    conn.sftp(function(err, sftp) {
        if (err) return callback(err);
        var destReadStart= 0;
        if (checkLocalSizes(file)) {
            if (fs.existsSync(file.localPaths[0])) {
                var stats = fs.statSync(file.localPaths[0]);
                destReadStart = stats.size;
            }
        } else {
            file.localPaths.forEach(function(file) {
                logger.info("Deleting "+file);
                cleanup.deleteFile(file);
            });
        }
        sftp.open(file.remotePath,'r', function(err, fd) {
            if (err) {
                logger.log('debug',"Problem opening file " +file.remotePath ); //logování pouze v případě problémů, normálně tam ty soubory nemusí být.
                logger.log('debug', err );
                sftp.end();
                return callback(null);
            }
            sftp.fstat(fd, function(err, stats) {
                logger.log('debug','remote size ' + stats.size + ' '+ file.remotePath );
                var flagReplace = 'a';
                if (stats.size < destReadStart) { //zaciname znovu
                    flagReplace = 'w';
                    destReadStart = 0;
                } else if (stats.size === destReadStart) {
                    logger.log('debug',"Skipping file " +file.remotePath );
                    sftp.end();
                    return callback(null);
                }
                var readStream = sftp.createReadStream(file.remotePath, {
                    start: destReadStart,
                    end: stats.size,
                    autoClose: true
                });
                logger.log('info','Processing file ' + file.remotePath);
                var writeStreams = [];
                file.localPaths.forEach(function(localPath){
                    logger.info("              --> " + localPath);
                    writeStreams.push(fs.createWriteStream(localPath, {flags: flagReplace}));
                });

                readStream
                    .on('data', function (chunk) {
                        writeStreams.forEach(function(writeStream){
                            writeStream.write(chunk);
                        });
                    })
                    .on('end', function () {
                        logger.log('debug','All the data in the file has been read (on.end readstream)');
                        writeStreams.forEach(function(writeStream){
                            writeStream.end();
                        });

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


