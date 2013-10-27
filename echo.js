// Echo Server
// ---------------
// Echo's message to file name with specified time interval
// Usage: node echo.js <filename> <time_in_ms>

var fs = require('fs');

// function to echo to log file with interfal amount
function echoLog (logfile, interval){
  var filename = logfile.split('/').pop();
  var now = new Date();
  var textLine = "Echoing at " + now.toString() + " to " + filename + " every " + interval + "ms.\n";
  fs.appendFile(logfile, textLine, function (err) {
    if (err) throw err;
    
    console.log(logfile, textLine);
  });
}

// basic error handing
// throw error if fewer than 4 parameters
if (process.argv.count < 4){
  console.log("first command line parameter must be file name, second must be time in milliseconds to repeat output");
}

else{
  // process command line arguments 
  var filename = process.argv[2];
  var timerInterval = process.argv[3];

  // throw error if timerInterval is not int
  if (typeof timerInterval === 'number' && Math.round(timerInterval) == timerInterval){
    console.log("second parameter must be integer in milliseconds");
  }
  else{
    setInterval(function(){echoLog(filename, timerInterval);}, timerInterval);
  }
}

