define(['jquery', 'underscore', 'backbone', 'views/filelist', 'views/log', 'socketio'],
       function($, _, Backbone, FileListView,LogView, io){

         // The Application
         // ---------------
         // Started overridding Backbone.sync, copied from backbon.iobind plugin
         Backbone.sync = function(method, model, options) {
           var params = _.extend({}, options);

           if (params.url) {
             params.url = _.result(params, 'url');
           } else {
             params.url = _.result(model, 'url') ;
           }

           console.log(params.url);

           var cmd = params.url.split('/')
           , namespace = (cmd[0] !== '') ? cmd[0] : cmd[1]; // if leading slash, ignore

           if ( !params.data && model)  {
             params.data = params.attrs || model.toJSON(options) || {};
           }
           console.log('sync:', method, 'model:', namespace, 'options:', options);
           // console.log('url:', _.result(model, 'url'));

           Backbone.socket.emit(namespace + ':' + method);

         };

         var App = Backbone.View.extend({
           el: $("#tailboneapp"),

           initialize: function() {
             // console.log('initializing app view...');
             var s = io.connect('http://localhost:3001/client'); 

             s.on('logline', function (data) {
               Backbone.trigger("newlogline", data);
               // console.log('got log', data);
             });
             s.on('files', function (data) {
               // console.log(data);
               Backbone.trigger("newfile", data);
             });
             Backbone.socket = s;
             this.socket = s;
             this.render();
           },

           render: function() {
             var fileListView = new FileListView();
             var logView = new LogView();
             fileListView.socket = this.socket;
             logView.socket = this.socket;
             this.$("#file-container").append(fileListView.render().el);
             this.$("#log-container").append(logView.render().el);
           }
         });
         return App;
       });
