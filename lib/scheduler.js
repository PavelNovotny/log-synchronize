/**
 *
 * Created by pavelnovotny on 06.02.17.
 */

var remoteTransfer = require('./remote-transfer.js');
var hourLogCat = require('./hour-log-cat.js');
var cleanup = require('./cleanup.js');
var nconf = require('nconf');
var utils = require('./utils.js');
var winston = require('winston');
var async = require('async');
var schedule = require('node-schedule');

var registeredTasks = {
    "cleanup-23hour-log" : cleanup.clean23hourFiles,
    "cleanup-30bytes-bgz" : cleanup.clean30ByteFiles,
    "daily-log-cat-and-cleanup" : hourLogCat.catHourLogs,
    "remote-transfer" : remoteTransfer.syncAll
}

process();

function process() {
    nconf.argv()
        .env()
        .argv()
        .defaults({ 'SYNC_ENV' : 'localhost' })
        .file({ file: 'config-'+nconf.get('SYNC_ENV')+'.json' });
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({'timestamp':true, 'level': nconf.get('logLevel')})
        ]
    });
    var tasks = nconf.get("tasks");
    logger.info("---------------- STARTING TASK SCHEDULER ------------------- ");
    for (var task in tasks) {
        run(task, tasks, logger);
    }
    cleanup.clean30ByteFiles(tasks["cleanup-30bytes-bgz"], logger, function() { 
       logger.info("Initial cleanup of 30bytes bgz finished.") 
    });
    cleanup.clean23hourFiles(tasks["cleanup-23hour-log"], logger, function() {
        logger.info("Initial cleanup of 23hour log files finished.")
    });
}

function run(taskKey, tasks, logger) {
    var interval = tasks[taskKey].interval;
    var scheduler = tasks[taskKey].scheduler;
    var func = registeredTasks[taskKey];
    if (func === undefined) {
        logger.error("TASK: "+taskKey +" is not in registeredTasks, cannot run.");
        return;
    }
    if (interval != undefined) {
        logger.info("TASK: "+ taskKey +" will run in interval of "+interval+" seconds.");
        runInterval(taskKey, tasks, logger);
        return;
    }
    if (scheduler != undefined) {
        logger.info("TASK: "+ taskKey +" is scheduled '"+scheduler+"'");
        runScheduler(taskKey, tasks, logger);
        return;
    }
    logger.error("TASK: "+taskKey +" no interval or scheduler defined");
}

function runInterval(taskKey, tasks, logger) {
    var task = tasks[taskKey];
    var func = registeredTasks[taskKey];
    logger.info("TASK: "+taskKey +" starting");
    func(task, logger, function(err) {
        if (err) logger.error(err);
        logger.info("TASK: "+taskKey +" finished, waiting for ", task.interval + " seconds");
        setTimeout(function() {
            runInterval(taskKey, tasks, logger);
        }, 1000 * task.interval);
    });
}

function runScheduler(taskKey, tasks, logger) {
    var task = tasks[taskKey];
    var func = registeredTasks[taskKey];
    var job = schedule.scheduleJob(task.scheduler, function(err) {
        if (err) logger.error(err);
        logger.info("TASK: "+taskKey +" starting");
        func(task, logger, function(){
            logger.info("TASK: "+taskKey +" finished, scheduler='"+task.scheduler+"'");
        });
    });
}

