var  kue =  require('kue');
var kOptions = require("./kuaServerConfig.js").testKue;

var queue = kue.createQueue(kOptions.kueOpts);

// Watch for stuck jobs, as PER REQUEST on GITHUB
queue.watchStuckJobs(kOptions.options.watchStuckTime);


 //Help removing large number of jobs for debugging only
 /*
kue.Job.rangeByState('complete',0, 5000, 'asc', function(err,jobs){
    jobs.forEach( function(job) {
        job.remove( function() {
            console.log('removed', job.id);
        });
    });
});


kue.Job.rangeByState('active',0, 15000, 'asc', function(err,jobs){
    jobs.forEach( function(job) {
        job.remove( function() {
            console.log('removed', job.id);
        });
    });
});

kue.Job.rangeByState('inactive',0, 15000, 'asc', function(err,jobs){
    jobs.forEach( function(job) {
        job.remove( function() {
            console.log('removed', job.id);
        });
    });
});


kue.Job.rangeByState('failed',0, 1000, 'asc', function(err,jobs){
    jobs.forEach( function(job) {
        job.remove( function() {
            console.log('removed', job.id);
        });
    });
});
*/

queue.on('ready', () => {
    console.info("Queue is ready");
});

queue.on('error', (err) => {
    console.error("There is an error in the main queue.");
    console.error(err);
    console.error(err.stack);
});

// Handle crashes with graceful shutdown
process.once('SIGTERM', function(sig) {
    var timeout=5000;
    queue.shutdown(timeout, function(sig){
        console.err('Kue shutdown: ', err || '');
        process.exit(0);
    });
});

// Setup the UI, Kue comes with an UI at the port listed to display upcoming jobs in the queue.
kue.app.set('title',kOptions.ui.title);
kue.app.listen(kOptions.ui.port);

module.exports.queue = queue;