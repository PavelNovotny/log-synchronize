/**
 *
 * Created by pavelnovotny on 07.12.16.
 */


// aspect_alsb_s1.audit.20161207.10 -> jms_s1_alsb_aspect.audit.20161207.10

function translateEsbName(oldName, domain) {
    return domain  + '_' + extractServer(oldName) + '_alsb_aspect.audit.' + extractDate(oldName);
}
module.exports.translateEsbName = translateEsbName;

function extractServer(oldName) {
    var serverName =  oldName.match(/s\d/);
    if (serverName) {
        return serverName[0];
    } else {
        return 's?';
    }
}

function extractDate(oldName) {
    var serverName =  oldName.match(/\d{1,}(\.\d{1,})*$/);
    if (serverName) {
        return serverName[0];
    } else {
        return '';
    }
}

console.log(extractServer('aspect_alsb_s3.audit.20161207.10'));
console.log(extractDate('aspect_alsb_s3.audit.20161207.10'));
console.log(extractDate('aspect_alsb_s3.audit.20161207'));
console.log(extractDate('aspect_alsb_s3.audit.2016127'));
console.log(extractDate('aspect_alsb_s3.audit.2016.2222'));
console.log(extractDate('aspect_alsb_s3.audit..22'));
console.log('date: ' + extractDate('aspect_alsb_s3.audit'));
console.log('translate: ' + translateEsbName('aspect_alsb_s3.audit','jms'));
console.log('translate: ' + translateEsbName('aspect_alsb_s3.audit','jms'));
console.log('translate: ' + translateEsbName('aspect_alsb_s3.audit.20161207.10','jms'));
