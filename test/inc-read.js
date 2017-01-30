/**
 *
 * Created by pavelnovotny on 13.01.17.
 */
var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
        if (err) throw err;
        fastGet(sftp);
    });
}).connect({
    host: 'sxcip413vm.ux.to2cz.cz',
    port: 22,
    username: 'x0534049',
    passphrase: 'bibione',
    privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
});

function fastGet(sftp) {
    sftp.fastGet(
        '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs/aspect_alsb_s1.log'
        ,'/users/pavelnovotny/Downloads/transfer/aaa.log'
        , {concurrency: 32, chunkSize: 32768}
        , function (err) {
            if (err) throw err;
            conn.end();
        }
    );
}

function partialGet(sftp) {
    sftp.open('/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs/aspect_alsb_s1.log', "r", function(err, fd) {
        sftp.fstat(fd, function(err, stats) {
            var bufferSize = stats.size,
                chunkSize = 16384,
                buffer = new Buffer(bufferSize),
                bytesRead = 0,
                errorOccured = false;

            while (bytesRead < bufferSize && !errorOccured) {
                if ((bytesRead + chunkSize) > bufferSize) {
                    chunkSize = (bufferSize - bytesRead);
                }
                sftp.read(fd, buffer, bytesRead, chunkSize, bytesRead, callbackFunc);
                bytesRead += chunkSize;
            }

            var totalBytesRead = 0;
            function callbackFunc(err, bytesRead, buf, pos) {
                if(err) {
                    writeToErrorLog("downloadFile(): Error retrieving the file.");
                    errorOccured = true;
                    sftp.close(fd);
                }
                totalBytesRead += bytesRead;
                data.push(buf);
                if(totalBytesRead === bufferSize) {
                    m_fileBuffer = Buffer.concat(data);
                    writeToLog("downloadFile(): File saved to buffer.");
                    sftp.close(fd);
                    m_eventEmitter.emit('downloadFile_Complete');
                }
            }
        });
    });
}
