/**
 *
 * Created by pavelnovotny on 28.02.17.
 */
//audit
var sourceTimeRegexp = new RegExp('aspect_alsb_s(\\d).audit(.\\d{8})?(.\\d{2})?');
var targetTimeExp = 'jms_s$1_alsb_aspect.audit$2$3';

console.log('aspect_alsb_s1.audit'.replace(sourceTimeRegexp, targetTimeExp));
console.log('aspect_alsb_s1.audit.20170228.07'.replace(sourceTimeRegexp, targetTimeExp));
console.log('aspect_alsb_s1.audit.20170228'.replace(sourceTimeRegexp, targetTimeExp));

//time
var sourceTimeRegexp = new RegExp('aspect_alsb_s(\\d).time(.\\d{8})?(.\\d{2})?');
var targetTimeExp = 'jms_s$1_alsb_aspect.time$2$3';

console.log('aspect_alsb_s1.time'.replace(sourceTimeRegexp, targetTimeExp));
console.log('aspect_alsb_s1.time.20170228.07'.replace(sourceTimeRegexp, targetTimeExp));
console.log('aspect_alsb_s1.time.20170228'.replace(sourceTimeRegexp, targetTimeExp));
