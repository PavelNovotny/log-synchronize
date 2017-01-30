/**
 *
 * Created by pavelnovotny on 18.01.17.
 */

var Client = require('ssh2').Client;
var translateName = require('./translate-name');
var fs = require('fs');
var async = require('async');
var nconf = require('nconf');

nconf.argv()
    .env()
    .defaults({ 'FILES_SYNC_ENV' : 'localhost' })
    .file({ file: 'config-'+nconf.get('FILES_SYNC_ENV')+'.json' });


syncAll();

function syncAll() {
    var transfers = nconf.get('transfers');
    async.eachSeries(transfers, function(transfer, callback) {
        console.log('Processing transfer ' + transfer.server);
        transfer.files = createTransferFilesList(transfer);
        syncServer(transfer, callback);
    }, function(err) {
        if( err ) {
            console.log('FAILED transfer');
        } else {
            console.log('Transfer successful');
        }
    });
}

function createTransferFilesList(transfer) {
    var files = [];
    var datum = getStringDate();
    transfer.files.forEach(function (file) {
        files.push(file);
        for (var i = 0;i<24;i++) {
            var hour = i<10?'0'+i:''+i;
            var newFile = {};
            newFile.remoteFile = file.remoteFile + '.' + datum + '.' + hour;
            newFile.destFolder = file.destFolder;
            files.push(newFile);
            console.log(newFile.remoteFile);
        }
    });
    return files;
}

function getStringDate() {
    var date = new Date();
    var dayIndex = date.getDate();
    var day = dayIndex<10?'0'+dayIndex:''+dayIndex;
    var monthIndex = date.getMonth()+1;
    var month = monthIndex<10?'0'+monthIndex:''+monthIndex;
    var year = date.getFullYear();
    var pattern = '' + year + month + day;
    return pattern;
}


function syncServer(transfer, callback) {
    var conn = new Client();
    conn.on('ready', function() {
        console.log('Downloading from server ' + transfer.server);
        downloadFiles(conn, transfer.files, callback);
    }).connect({
        host: transfer.server,
        port: 22,
        username: transfer.username,
        passphrase: transfer.passphrase,
        privateKey: require('fs').readFileSync(transfer.privateKey)
    });
}

function downloadFiles(conn, files, callback) {
    async.eachSeries(files, function(file, callback) {
        console.log('Processing file ' + file.remoteFile);
        downloadFile(conn, file, callback);
    }, function(err) {
        conn.end();
        if( err ) {
            console.log('FAILED');
            console.log(err);
        } else {
            console.log('All files have been processed successfully');
            return callback();
        }
    });
}

function downloadFile(conn, file, callback) {
    var domain = file.remoteFile.includes('jms')?'jms':'other';
    var localFile = file.destFolder + '/' + translateName.translateEsbName(file.remoteFile, domain);
    console.log(localFile);
    console.log(file.remoteFile);
    conn.sftp(function(err, sftp) {
        if (err) return callback(err);
        var destReadStart= 0;
        if (fs.existsSync(localFile)) {
            var stats = fs.statSync(localFile);
            destReadStart = stats.size;
        }
        sftp.open(file.remoteFile,'r', function(err, fd) {
            if (err) {
                console.log("Problem opening file " +file.remoteFile );
                sftp.end();
                return callback(null);
            }
            sftp.fstat(fd, function(err, stats) {
                console.log('remote size ' + stats.size);
                var flagReplace = 'a';
                if (stats.size < destReadStart) {
                    flagReplace = 'w';
                    destReadStart = 0;
                }
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
                        console.log('All the data in the file has been read');
                        writeStream.close();
                    })
                    .on('close', function () {
                        console.log('Closed ');
                        sftp.end();
                        return callback(null);
                    });
            });
        });
    });
}


