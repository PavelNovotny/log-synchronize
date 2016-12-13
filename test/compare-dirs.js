/**
 * 
 * Created by pavelnovotny on 06.12.16.
 */
var Client = require('ssh2').Client;
var translate = require('./translate-name.js');


function connectionParameters(server, user) {
    return {
        host: server,
        port: 22,
        username: user,
        passphrase: 'bibione',
        privateKey: require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa')
    }
}

function listServerDir(dir, server, user, source, callback) {
    var conn = new Client();
    conn.on('ready', function() {
        console.log('Client :: ready');
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            sftp.readdir(dir, function(err, list) {
                if (err) throw err;
                conn.end();
                callback(list, source);
            });
        });
    }).connect(connectionParameters(server, user));
}

//todo use params
var params =  {
    dir: "",
    server: "",
    username: "",
    domain:"",
    source: false
}



function process() {
    var completed = 0;
    var tasks = [
        function (callback) {
            listServerDir('/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs', 'sxcip413vm.ux.to2cz.cz', 'x0534049', true, callback);
        }
        ,function (callback) {
            listServerDir('/appl/home/ciplogs/logs/gf_esb_predpr_logs', 'LXCIPPPT401.ux.to2cz.cz', 'ciplogs', false, callback);
        }
    ];
    var source, dest
    tasks.forEach(function(task) {
        task(function(list, isSource) {
            if (isSource) {
                source = list;
            } else {
                dest = list;
            }
            if(++completed === tasks.length) {
                compareLists(source, dest);
            }
        });
    });
}

function compareLists(source, dest) {
    var compare_pattern = 'audit.20161213';
    source.forEach(function(sourceItem) {
        sourceItem.transferEligible = false;
        if (sourceItem.filename.indexOf(compare_pattern) !== -1) {
            sourceItem.transferEligible = true;
            sourceItem.transferred = false;
            dest.forEach(function(destItem) {
                if (destItem.filename.indexOf(compare_pattern) !== -1) {
                    //console.log('comparing ' + sourceItem.filename + '->' + destItem.filename);
                    if ((translate.translateEsbName(sourceItem.filename, "other") === destItem.filename) || (translate.translateEsbName(sourceItem.filename, "other")+'.bgz' === destItem.filename)) {
                        sourceItem.transferred = true;
                    }
                }
            });
        }
    });
    source.forEach(function(sourceItem) {
        if (sourceItem.transferEligible && !sourceItem.transferred) {
            console.log('should transfer ' + sourceItem.filename + '->' + translate.translateEsbName(sourceItem.filename, "other"));
        } else if (sourceItem.transferEligible) {
            console.log('already transferred ' + sourceItem.filename);
        }
    });
    console.log("all tasks finished.");
}

process();
