// Tailbone Server
// ---------------
// Caches log updates and routes them to clients in real time.
// Usage: node server.js

var START_FILE_ID = 10;
var START_LINE_ID = 1000;
var SOCKET_IO_LISTEN_PORT = 3001;
var EXPRESS_LISTEN_PORT = process.env.PORT || 3000;

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/app'));
app.listen(EXPRESS_LISTEN_PORT, function(){
  console.log('listening on %s')
});

var redis = require("redis"),
    cache = redis.createClient(),
    io = require('socket.io').listen(SOCKET_IO_LISTEN_PORT, {log: false, origins: '*:*'});

// Check that DB is initialized, if not, initialize
var getGlobalIds = function (callback){
  cache.get("global:nextFileId", function(err, nextFileId){
  console.log("GET nextFileId: ", nextFileId);
  if (nextFileId == null){
    console.log("global:nextFileId is null setting to ", START_FILE_ID);
    cache.set("global:nextFileId", START_FILE_ID, redis.print);
    nextFileId = START_FILE_ID
  }
  cache.get("global:nextLineId", function(err, nextLineId){
    console.log("GET nextLineId: ", nextLineId);
    if (nextLineId == null){
      console.log("global:nextLineId is null setting to ", START_LINE_ID);
      cache.set("global:nextLineId", START_LINE_ID, redis.print);
      nextLineId = START_LINE_ID;
    }
    cache.del("global:files", null, function(err, didClearFiles){
      callback(nextFileId, nextLineId);
    });
  });
});
};

getGlobalIds(function(nextFileId, nextLineId){


// Socket.io endpoint for web clients connecting that want to see updstes
// When client requests files, read them from cache and send them via socket.io.
var client = io.of('/client').on('connection', function (socket) {
  socket.on('files:read', function(data){
    cache.lrange("global:files", 0, 10, function(err, reply){
      console.log("getFiles.reply", reply); console.log("getFiles.err", err);
      if (!err){
        reply.forEach(function(fid){
          var fid2name = {};
          cache.get("file:"+fid+":name", function(err, reply){
            var f = {_id: fid, name: reply};
            socket.emit('files', [f]);
          });
          
        });
      }
    });
  });
  socket.on('log:read', function(data){
    var fid = data._id;
    console.log('log:read', data);
  cache.lrange("file:"+fid+":lines", 0, 10, function(err, lids){
            lids.forEach(function(lid){
              cache.get("line:"+lid+":text", function(err, reply){
                console.log("getLines.reply", reply); console.log("getLines.err", err);
                var l = {_id: lid, fid:fid, lineText: reply};
                socket.emit('logline', l);
              });
            });
          });
  });
});

// Socket.io endpoint for watch.js to report updates of log file
var watch = io.of('/watch').on('connection', function(socket) {
  // watch.js connected and sent notification of file being watched
  socket.on('watchfile', function (data) {
    var watchfile = data.trim();
    console.log ('watch.js connected to watch file: ', watchfile);
    socket.set('watchfile', watchfile, function(){
      cache.incr("global:nextFileId", function(err, reply){
        // console.log("createFile.err: ", err); console.log("createFile.reply: ", reply);
        if (!err){
          socket.set("fid", reply, function(){
            cache.set("file:"+reply+":name", watchfile, redis.print); 
            cache.lpush("global:files", reply);
          });
        }
      });
      socket.emit('response', 'ok');
    });
  });

  // new log line is received, cached, and reported to web clients
  socket.on('logline', function(data){
    socket.get('fid', function(err, reply){
      data.fid = reply;
      cache.incr("global:nextLineId", function(err, reply){
        // console.log("createLine.err: ", err, "createLine.reply: ", reply);
        if (!err){
          cache.set("line:"+reply+":fid", data.fid);
          cache.set("line:"+reply+":text", data.lineText);
          cache.lpush("file:"+data.fid+":lines", reply);
          data._id = reply;
          // Report to client over socket.io for update
          // console.log('logline', data)
          client.emit('logline', data);
        }
      });
    });
  });

  socket.on('disconnect', function(){
    socket.get('fid', function(err, reply){
      var fid = reply;
      // watch.js client disconnected, remove from cache for now
      cache.lrem("global:files", 1, fid, function(err, reply){
        console.log('disconnected, removed watch file for fid:', fid);
      });
    });
  });
});
});
