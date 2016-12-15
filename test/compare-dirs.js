/**
 * 
 * Created by pavelnovotny on 06.12.16.
 */
var Client = require('ssh2').Client;
var translate = require('./translate-name.js');
var transfer = require('./transfer.js');


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
        //console.log('Client :: ready');
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            sftp.readdir(dir, function(err, list) {
                if (err) throw err;
                if (conn.end()) {
                    console.log('closing list server files OK');
                } else {
                    console.log('Problem closing list server files');
                }
                callback(list, source);
            });
        });
    }).on('continue', function() {
        console.log('Should continue');
    }).on('error', function(e) {
        console.log(e);
    }).connect(connectionParameters(server, user));
}

function process(sourceSrv, destSrv, compare_pattern) {
    var domain = sourceSrv.dir.indexOf('other') !== -1?'other':'jms';
    var completed = 0;
    var tasks = [
        function (callback) {
            listServerDir(sourceSrv.dir, sourceSrv.server, sourceSrv.username, true, callback);
        }
        ,function (callback) {
            listServerDir(destSrv.dir, destSrv.server, destSrv.username, false, callback);
        }
    ];
    var source, dest;
    tasks.forEach(function(task) {
        task(function(list, isSource) {
            if (isSource) {
                source = list;
            } else {
                dest = list;
            }
            if(++completed === tasks.length) {
                var transferList = compareLists(source, dest, domain, compare_pattern);
                transfer.transfer(sourceSrv, destSrv, domain, transferList);
                console.log("all tasks finished.");
            }
        });
    });
}

function compareLists(source, dest, domain, compare_pattern) {
    source.forEach(function(sourceItem) {
        sourceItem.transferEligible = false;
        if (sourceItem.filename.indexOf(compare_pattern) !== -1) {
            sourceItem.transferEligible = true;
            sourceItem.transferred = false;
            dest.forEach(function(destItem) {
                if (destItem.filename.indexOf(compare_pattern) !== -1) {
                    //console.log('comparing ' + sourceItem.filename + '->' + destItem.filename);
                    if ((translate.translateEsbName(sourceItem.filename, domain) === destItem.filename) || (translate.translateEsbName(sourceItem.filename, domain)+'.bgz' === destItem.filename)) {
                        sourceItem.transferred = true;
                    }
                }
            });
        }
    });
    var transferList = [];
    source.forEach(function(sourceItem) {
        if (sourceItem.transferEligible && !sourceItem.transferred) {
            console.log('should transfer ' + sourceItem.filename + '->' + translate.translateEsbName(sourceItem.filename, domain));
            transferList.push(sourceItem);
        } else if (sourceItem.transferEligible) {
            console.log('already transferred ' + sourceItem.filename);
        }
    });
    console.log('returning transfer list');
    return transferList;
}

var other1 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs',
    server: 'sxcips403vm.ux.to2cz.cz',
    username: 'x0534049'
};
var other2 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs',
    server: 'sxcips404vm.ux.to2cz.cz',
    username: 'x0534049'
};
var jms1 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_jms/logs',
    server: 'sxcips403vm.ux.to2cz.cz',
    username: 'x0534049'
};
var jms2 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_jms/logs',
    server: 'sxcips404vm.ux.to2cz.cz',
    username: 'x0534049'
};
var logServer =  {
    dir: "/appl/home/ciplogs/logs/gf_esb_predpr_logs",
    server: "LXCIPPPT401.ux.to2cz.cz",
    username: "ciplogs"
}

var date = new Date();
var dayIndex = date.getDate();
var day = dayIndex<10?'0'+dayIndex:''+dayIndex;
var monthIndex = date.getMonth()+1;
var month = monthIndex<10?'0'+monthIndex:''+monthIndex;
var year = date.getFullYear();

var pattern = 'audit.' + year + month + day;
process(other1, logServer, pattern);
//process(other2, logServer, pattern);
process(jms1, logServer, pattern);
process(jms2, logServer, pattern);
