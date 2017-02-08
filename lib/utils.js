/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */

module.exports.getDate = function(incrementDay) {
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

