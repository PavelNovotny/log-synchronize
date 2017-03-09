/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */

var fs = require('fs');

module.exports.getDate = getDate;

function getDate(incrementDay) {
    var date = new Date();
    date.setDate(date.getDate()+incrementDay);
    var dayIndex = date.getDate();
    var day = dayIndex<10?'0'+dayIndex:''+dayIndex;
    var monthIndex = date.getMonth()+1;
    var month = monthIndex<10?'0'+monthIndex:''+monthIndex;
    var year = date.getFullYear();
    var pattern = '' + year + month + day;
    return pattern;
}

module.exports.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

module.exports.includes = function(str, substr) {
    return str.indexOf(substr) !== -1;
}

module.exports.prepareRegex = function(str) {
    str =  str.replace("{today}", getDate(0));
    return str.replace("{yesterday}", getDate(-1));
}


module.exports.getConnectionParams = function(transfer) {
    var params = {
        host: transfer.server,
        port: 22,
        username: transfer.username,
        passphrase: transfer.passphrase,
        privateKey: fs.readFileSync(transfer.privateKey)
    };
    if (transfer.passphrase === null) {
        delete params.passphrase;
    }
    return params;
}

