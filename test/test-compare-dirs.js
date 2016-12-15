/**
 *
 * Created by pavelnovotny on 14.12.16.
 */

var compare_dirs = require('../lib/compare-dirs.js');
var transfer = require('../lib/transfer.js');

var date = new Date();
var dayIndex = date.getDate();
var day = dayIndex<10?'0'+dayIndex:''+dayIndex;
var monthIndex = date.getMonth()+1;
var month = monthIndex<10?'0'+monthIndex:''+monthIndex;
var year = date.getFullYear();
var pattern = 'audit.' + year + month + day;
var privateKey = require('fs').readFileSync('/Users/pavelnovotny/.ssh/id_rsa'); 
var passphrase = 'bibione';
var other1 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs',
    server: 'sxcips403vm.ux.to2cz.cz',
    username: 'x0534049',
    passphrase: passphrase,
    privateKey: privateKey
};
var other2 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_other/logs',
    server: 'sxcips404vm.ux.to2cz.cz',
    username: 'x0534049',
    passphrase: passphrase,
    privateKey: privateKey
};
var jms1 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_jms/logs',
    server: 'sxcips403vm.ux.to2cz.cz',
    username: 'x0534049',
    passphrase: passphrase,
    privateKey: privateKey
};
var jms2 =  {
    dir: '/app/bea/OFM11g/user_projects/domains/cip_esb_predpr_jms/logs',
    server: 'sxcips404vm.ux.to2cz.cz',
    username: 'x0534049',
    passphrase: passphrase,
    privateKey: privateKey
};
var logServer =  {
    dir: "/appl/home/ciplogs/logs/gf_esb_predpr_logs",
    server: "LXCIPPPT401.ux.to2cz.cz",
    username: "ciplogs",
    passphrase: passphrase,
    privateKey: privateKey
}

var destPath = '/Users/pavelnovotny/Downloads/transfer';

compare_dirs.compareDir(other1
    ,destPath
    ,pattern
    ,transfer.transfer
);
compare_dirs.compareDir(other2
    ,destPath
    ,pattern
    ,transfer.transfer
);
compare_dirs.compareDir(jms1
    ,destPath
    ,pattern
    ,transfer.transfer
);
compare_dirs.compareDir(jms2
    ,destPath
    ,pattern
    ,transfer.transfer
);



