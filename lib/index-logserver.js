/**
 *
 * Created by pavelnovotny on 05.12.16.
 */
var compare_dirs = require('./compare-dirs.js');
var transfer = require('./transfer.js');

var date = new Date();
var dayIndex = date.getDate();
var day = dayIndex<10?'0'+dayIndex:''+dayIndex;
var monthIndex = date.getMonth()+1;
var month = monthIndex<10?'0'+monthIndex:''+monthIndex;
var year = date.getFullYear();
var pattern = 'audit.' + year + month + day;
var privateKey = require('fs').readFileSync('/appl/home/ciplogs/node-apps/log-sync/.ssh/id_rsa');
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
compare_dirs.compareDir(other1
    ,'/appl/home/ciplogs/node-apps/log-sync/logs'
    ,pattern
    ,transfer.transfer
);
compare_dirs.compareDir(other2
    ,'/appl/home/ciplogs/node-apps/log-sync/logs'
    ,pattern
    ,pattern
    ,transfer.transfer
);
compare_dirs.compareDir(jms1
    ,'/appl/home/ciplogs/node-apps/log-sync/logs'
    ,pattern
    ,transfer.transfer
);
compare_dirs.compareDir(jms2
    ,'/appl/home/ciplogs/node-apps/log-sync/logs'
    ,pattern
    ,transfer.transfer
);

