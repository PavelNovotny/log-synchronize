/**
 * 
 * Created by pavelnovotny on 06.12.16.
 */
var Client = require('ssh2').Client;
var translate = require('./translate-name.js');
var connPars = require('./connect-pars.js');
var fs = require('fs');

module.exports.compareDir = compareDir;


function listServerDir(server, isSource, callback) {
    var conn = new Client();
    conn.on('ready', function() {
        console.log('Client ready list dir ' + server.server +' '+server.dir);
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            var readDirOK = sftp.readdir(server.dir, function(err, list) {
                if (err) throw err;
                if (conn.end()) {
                    // console.log('closing list server files OK list dir ' + server.server +' '+server.dir);
                } else {
                    // console.log('Problem closing list dir ' + server.server +' '+server.dir);
                }
                callback(list, isSource);
            });
        });
    }).on('continue', function() {
        console.log('should continue  list dir ' + server.server +' '+server.dir);
    }).on('error', function(e) {
        console.log('error on list dir ' + server.server +' '+server.dir);
        console.log(e);
    }).on('end', function() {
        console.log('end of socket  list dir ' + server.server +' '+server.dir);
    }).on('close', function() {
        console.log('close of socket list dir ' + server.server +' '+server.dir);
    }).connect(connPars.connectionParameters(server));
}

function listDirLocal(folder, isSource, callback) {
    fs.readdir(folder, function(err, files) {
        if (err) throw err;
        callback(files, isSource);
    });
}


function compareDir(sourceSrv, destFolder, compare_pattern, callback) {
    var domain = sourceSrv.dir.indexOf('other') !== -1?'other':'jms';
    var completed = 0;
    var tasks = [
        function (callback) {
            listServerDir(sourceSrv, true, callback);
        }
        ,function (callback) {
            listDirLocal(destFolder, false, callback);
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
                callback(sourceSrv, destFolder, transferList);
                console.log('all tasks finished list dir ' + sourceSrv.server +' '+sourceSrv.dir);
            }
        });
    });
}

function compareLists(source, dest, domain, comparePattern) {
    source.forEach(function(sourceItem) {
        sourceItem.transferEligible = false;
        if (sourceItem.filename.indexOf(comparePattern) !== -1) {
            sourceItem.transferEligible = true;
            sourceItem.transferred = false;
            dest.forEach(function(destItem) {
                if (destItem.indexOf(comparePattern) !== -1) {
                    //console.log('comparing ' + sourceItem.filename + '->' + destItem);
                    var translatedName = translate.translateEsbName(sourceItem.filename, domain);
                    if ((translatedName === destItem) || (translatedName+'.bgz' === destItem)) {
                        sourceItem.transferred = true;
                    }
                }
            });
        }
    });
    var transferList = [];
    source.forEach(function(sourceItem) {
        if (sourceItem.transferEligible && !sourceItem.transferred) {
            sourceItem.translatedName = translate.translateEsbName(sourceItem.filename, domain);
            //console.log('should transfer ' + sourceItem.filename + '->' + sourceItem.translatedName);
            transferList.push(sourceItem);
        } else if (sourceItem.transferEligible) {
            console.log('already transferred ' + translate.translateEsbName(sourceItem.filename, domain));
        }
    });
    return transferList;
}

