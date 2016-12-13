/**
 *
 * Created by pavelnovotny on 05.12.16.
 */
var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
    console.log('Client :: ready');
    conn.exec('uptime', function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', function(data) {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
        });
    });
}).connect({
    host: 'sxcip413vm.ux.to2cz.cz',
    port: 22,
    username: 'x0534049',
    passphrase: 'bibione',
    privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
});
