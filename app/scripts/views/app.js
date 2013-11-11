define(['jquery', 'underscore', 'backbone', 'views/filelist', 'views/log', 'socketio'],
       function($, _, Backbone, FileListView,LogView, io){
         // Production Settings
         var CLIENT_API_ENDPOINT = 'http://tailboneapi.eliotbaker.com/client';
         // Dev settings
         // var CLIENT_API_ENDPOINT = 'http://localhost:3001/client';

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
             this.isAppLoading = true;
             Backbone.trigger('toggleAppLoading', false);
             // console.log('initializing app view...');
             var s = io.connect(CLIENT_API_ENDPOINT);

             console.log('socket: ', s);

             s.on('connect', function(){
               // console.log('connected to s');
             });

             s.on('error', function (data) {
               console.log(data || 'error');
               $('#errorModal').modal('show');
             });

             s.on('disconnect', function(){
               // console.log('disconnected to s');
               Backbone.trigger('toggleAppLoading', true);
             });

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
             Backbone.on('toggleAppLoading', this.toggleAppLoading, this);
             this.render();
           },

           render: function() {
             var fileListView = new FileListView();
             var logView = new LogView();
             fileListView.socket = this.socket;
             logView.socket = this.socket;
             this.$("#file-container").append(fileListView.render().el);
             this.$("#log-container").append(logView.render().el);
           },

           toggleAppLoading: function(toggleValue){
             this.isAppLoading = toggleValue;
             if (!this.isAppLoading){
               $('#circularG').fadeOut(function(){
                 $('#files-logs').fadeIn();
                 $('#log-container').animate({"scrollTop": $('#log-container')[0].scrollHeight}, "fast");
               });
               
             }
             else{
               $('#circularG').show();
               $('#files-logs').hide();
             }

           }
         });
         return App;
       });
