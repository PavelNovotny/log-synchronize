/**
 * 
 * Created by pavelnovotny on 06.12.16.
 */
var fs = require('fs');

var Client = require('ssh2').Client;
var conn = new Client();
conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
        if (err) throw err;
        var readStream = sftp.createReadStream('/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs/aspect_alsb_s1.log', {start: 1000, end: 1100000, autoClose:true});
        var destStream = fs.createWriteStream('/Users/pavelnovotny/Downloads/cilove.txt');
        readStream.pipe(destStream);
    });
}).connect({
    host: 'sxcip413vm.ux.to2cz.cz',
    port: 22,
    username: 'x0534049',
    passphrase: 'bibione',
    privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
});



