/**
 *
 * Created by pavelnovotny on 28.02.17.
 */
//audit
var sourceAuditRegexp = new RegExp('aspect_alsb_s(\\d).audit(.\\d{8})?(.\\d{2})?');
var targetAuditExp = 'jms_s$1_alsb_aspect.audit$2$3';

console.log('aspect_alsb_s1.audit'.replace(sourceAuditRegexp, targetAuditExp));
console.log('aspect_alsb_s1.audit.20170228.07'.replace(sourceAuditRegexp, targetAuditExp));
console.log('aspect_alsb_s1.audit.20170228'.replace(sourceAuditRegexp, targetAuditExp));

//time
var sourceTimeRegexp = new RegExp('aspect_alsb_s(\\d).time(.\\d{8})?(.\\d{2})?');
var targetTimeExp = 'jms_s$1_alsb_aspect.time$2$3';

console.log('aspect_alsb_s1.time'.replace(sourceTimeRegexp, targetTimeExp));
console.log('aspect_alsb_s1.time.20170228.07'.replace(sourceTimeRegexp, targetTimeExp));
console.log('aspect_alsb_s1.time.20170228'.replace(sourceTimeRegexp, targetTimeExp));

//bpm
var sourceBpmRegexp = new RegExp('cip_bpm_s(\\d).log(.\\d{8})?(.\\d{2})?');
var targetBpmExp = 'cip_bpm_s$1.log$2$3';

console.log('cip_bpm_s2.log'.replace(sourceBpmRegexp, targetBpmExp));
console.log('cip_bpm_s2.log.20170227'.replace(sourceBpmRegexp, targetBpmExp));
console.log('cip_bpm_s2.log.20170227.08'.replace(sourceBpmRegexp, targetBpmExp));

//test local audit
var testTargetAuditExp = "jms_s$1_alsb_aspect.audit$2$3.bgz";
var testRegex = 'aspect_alsb_s1.audit'.replace(sourceAuditRegexp, testTargetAuditExp);
var testAuditRegexp = new RegExp(testRegex);
console.log(testRegex);
console.log(testAuditRegexp.test('jms_s1_alsb_aspect.audit.bgz'));
console.log(testAuditRegexp.test('jms_s1_alsb_aspect.audit'));

//test daily logs
var hourLogsRegexp = new RegExp('(jms_s|other_s)(\\d)_alsb_aspect.(audit|time)(.\\d{8})(.\\d{2})');
var targetDailyExp = '$1$2_alsb_aspect.$3$4';
console.log('jms_s1_alsb_aspect.audit.20170227.08'.replace(hourLogsRegexp, targetDailyExp));
console.log('other_s2_alsb_aspect.audit.20170227.08'.replace(hourLogsRegexp, targetDailyExp));
console.log(hourLogsRegexp.test('other_s2_alsb_aspect.audit.20170227'));
console.log(hourLogsRegexp.test('other_s2_alsb_aspect.audit.20170227.00'));




