/**
 * 
 * Created by pavelnovotny on 06.12.16.
 */
var Client = require('ssh2').Client;
var fs = require('fs');

//parametry
var remoteFile = '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_jms/logs/aspect_alsb_s1.audit';



var conn = new Client();
conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
        if (err) throw err;
        //todo kdy mazat cílový soubor až je uložená velikost větší než aktuální
        var destReadStart= 0;
        if (fs.existsSync('/Users/pavelnovotny/Downloads/cilove.txt')) {
            var stats = fs.statSync('/Users/pavelnovotny/Downloads/cilove.txt');
            destReadStart = stats.size;
        }
        sftp.open(remoteFile,'r', function(err, fd) {
            sftp.fstat(fd, function(err, stats) {
                console.log('remote size ' + stats.size);
                var flagReplace = 'a';
                if (stats.size < destReadStart) {
                    flagReplace = 'w';
                    destReadStart = 0;
                }
                var readStream = sftp.createReadStream(remoteFile, {
                    start: destReadStart,
                    end: stats.size,
                    autoClose: true
                });
                var writeStream = fs.createWriteStream('/Users/pavelnovotny/Downloads/cilove.txt', {flags: flagReplace});
                readStream
                    .on('data', function (chunk) {
                        writeStream.write(chunk);
                    })
                    .on('end', function () {
                        console.log('All the data in the file has been read');
                        writeStream.close();
                    })
                    .on('close', function () {
                        console.log('Closed');
                        conn.end();
                    });
            });
        });

    });
}).connect({
    host: 'sxcip413vm.ux.to2cz.cz',
    port: 22,
    username: 'x0534049',
    passphrase: 'bibione',
    privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
});



