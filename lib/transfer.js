var Client = require('ssh2').Client;
var translate = require('./translate-name.js');
var connPars = require('./connect-pars.js');
module.exports.transfer = transfer;

function transfer(sourceSrv, destFolder, transferList) {
    transferList.forEach(function(transferItem) {
        transferSourceFile(sourceSrv, destFolder, transferItem);
    });
}

function transferSourceFile(sourceSrv, destFolder, transferItem) {
    //console.log('should transfer ' + transferItem.filename + '->' + transferItem.translatedName);
    var sourcePath = sourceSrv.dir + '/' + transferItem.filename;
    // console.log('source path '+sourcePath);
    var destPath = destFolder +'/' + transferItem.translatedName;
    // console.log('dest path ' + destPath);
    var conn = new Client();
    conn.on('ready', function() {
        console.log('Client ready transfer file ' + sourceSrv.server + ' '+ sourceSrv.filename);
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            sftp.fastGet(
                sourcePath
                ,destPath
                ,{concurrency: 32, chunkSize: 32768}
                ,function (err) {
                    if (err) throw err;
                    if (conn.end()) {
                        // console.log('closing tranfer source file OK');
                    } else {
                        // console.log('Problem closing tranfer source file');
                    }
                }
            );
        });
    }).on('continue', function() {
        console.log('transfer file should continue ' + sourceSrv.server + ' '+ sourceSrv.filename);
    }).on('error', function(e) {
        console.log('transfer file error on' + sourceSrv.server + ' '+ sourceSrv.filename);
        console.log(e);
    }).on('end', function() {
        console.log('transfer file end of socket '+ sourceSrv.server + ' '+ sourceSrv.filename);
    }).on('close', function() {
        console.log('transfer file close of socket '+ sourceSrv.server + ' '+ sourceSrv.filename);
    }).connect(connPars.connectionParameters(sourceSrv));
}



