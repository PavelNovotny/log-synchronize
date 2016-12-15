/**
 *
 * Created by pavelnovotny on 06.12.16.
 */
var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
        if (err) throw err;
        sftp.fastGet(
            '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs/aspect_alsb_s1.log'
            ,'/users/pavelnovotny/Downloads/aaa.log'
            , {concurrency: 32, chunkSize: 32768}
            , function (err) {
                if (err) throw err;
                conn.end();
            }
        );
    });
}).connect({
    host: 'sxcip413vm.ux.to2cz.cz',
    port: 22,
    username: 'x0534049',
    passphrase: 'bibione',
    privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
});



