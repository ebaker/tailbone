// Watch Server
// ---------------
// Watch filename in parameter by spawning unix tail -f command.
// Usage: node watch.js <filename>

var _ = require('underscore');
var socket = require('socket.io-client').connect("http://localhost:3001/watch");

var spawn = require('child_process').spawn;

var hostname = 'localhost';
var filename = process.argv[2];
var watchfile = filename; 

console.log(filename);

var tail = undefined;

socket.on('connect', function () { 
    socket.emit('watchfile', watchfile);
  });

socket.on('response', function(data){
  // console.log('response: ', data);
  // console.log('tail: ', tail);
  if (tail){
    tail.kill();
  }
  tail = spawn('tail', ['-f', filename]);
  tail.stdout.on('data', function (data) {
    var stringData = data.toString('utf8');
    var strings = stringData.split('\n');
    _.each(strings, function(line){
      line = line.trim();
      if (line != ''){
        socket.emit('logline', {name: watchfile, lineText: line});
      }
    });
    console.log(data.toString('utf8'));
  });
});

