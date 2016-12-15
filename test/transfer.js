var Client = require('ssh2').Client;
var translate = require('./translate-name.js');
module.exports.transfer = transfer;

function transfer(sourceSrv, destSrv, domain, transferList) {
    transferList.forEach(function(transferItem) {
        transferSourceFile(sourceSrv, destSrv, domain, transferItem);
    });
}

function transferSourceFile(sourceSrv, destSrv, domain, transferItem) {
    console.log('should transfer ' + transferItem.filename + '->' + translate.translateEsbName(transferItem.filename, domain));
    var sourcePath = sourceSrv.dir + '/' + transferItem.filename;
    console.log(sourcePath);
    var newName = translate.translateEsbName(transferItem.filename, domain);
    var destPath = '/Users/pavelnovotny/Downloads/transfer/' + newName;
    console.log(destPath);
    var conn = new Client();
    conn.on('ready', function() {
        console.log('Client ready');
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            sftp.fastGet(
                sourcePath
                ,destPath
                , {concurrency: 32, chunkSize: 32768}
                , function (err) {
                    if (err) throw err;
                    if (conn.end()) {
                        console.log('closing tranfer source file OK');
                    } else {
                        console.log('Problem closing tranfer source file');
                    }
                    transferDestFile(destPath, destSrv, newName);
                }
            );
        });
    }).connect({
        host: sourceSrv.server,
        port: 22,
        username: sourceSrv.username,
        passphrase: 'bibione',
        privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
    });
}

function transferDestFile(sourcePath, destSrv, newName) {
    var destPath = destSrv.dir + '/' + newName;
    console.log(destPath);
    var conn = new Client();
    conn.on('ready', function() {
        console.log('Dest Client ready');
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            sftp.fastPut(
                sourcePath
                ,destPath
                , {concurrency: 32, chunkSize: 32768}
                , function (err) {
                    if (err) throw err;
                    if (conn.end()) {
                        console.log('closing tranfer dest file OK');
                    } else {
                        console.log('Problem closing tranfer dest file');
                    }
                }
            );
        });
    }).connect({
        host: destSrv.server,
        port: 22,
        username: destSrv.username,
        passphrase: 'bibione',
        privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
    });
}


