// Models

var FileModel = Backbone.Model.extend({
  defaults: function(){
    return {
      name: 'undefined file'
      };
  }
});

var LogLineModel = Backbone.Model.extend({
  defaults: function(){
    return {
      _id: 0,
      name: 'undefined-file.log',
      lineNumber: 0,
      lineText: 'some undefined log file text...'
      };
  }
});

// Collections

var FileCollection = Backbone.Collection.extend({
  model: FileModel,
  
  //localStorage: new Store('files-store')
  url: function() { return "/files"; }
});

var LogLineCollection = Backbone.Collection.extend({
  model: LogLineModel,
  
  // localStorage: new Store('loglines-store')
  url: function() { return "/loglines"; }
});

// Views

var FileView = Backbone.View.extend({

  tagName: "a",
  className: 'list-group-item file-btn btn',

  template: _.template($('#file-template').html()),

  events: {
    'click': 'activate'
  },

  initialize: function(){
    // stub
  },

  render: function(){
    console.log('fileview render', this.model.toJSON());
    this.$el.html(this.template(this.model.toJSON()));
    // console.log('active file count', $('.file-btn.active').size());
    if ($('.file-btn.active').size() == 0){
      this.activate();
    }        
    return this;
  },

  activate: function(){
    $('.file-btn').removeClass("active");
    this.$el.attr("id", this.model.get('_id'));
    this.$el.addClass("active");
    var fileToActivate = 'show:fid_' + this.model.get('_id');
    // console.log('activate:', fileToActivate);
    Backbone.trigger('hide:logline').trigger(fileToActivate, this.model.get('fid'));
    $('#logline-name').text(this.model.get('name'));
    $('#log-container').scrollTop($('#log-container')[0].scrollHeight);

  }
});

var LogLineView = Backbone.View.extend({

  tagName: "li",

  className: function(){
    var c = "loglineView list-group-item";
    c = c + " fid_" + this.model.get("fid");
    return c;
  },

  template: _.template($('#logline-template').html()),

  initialize: function(){
    var fileToActivate = this.model.get('fid');
    // console.log(this.model.get('name'));
    Backbone.on("hide:logline", this.doHide, this);
    Backbone.on("show:fid_" + fileToActivate, this.doShow, this);
    return this;
  },

  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    var $active = $('.file-btn.active')[0];
    if ($active != undefined)
    if (this.model.get('fid') == $active.id){
      // console.log('showAddedFile');
    }
    else{
      // console.log('hideAddedFile');
      this.doHide();
    }
    return this;
  },
  
  doHide: function(){
    this.$el.hide();
  },

  doShow: function(){
    this.$el.show();
  }
});

       var LogView = Backbone.View.extend({
         tagName: 'ul',
         className: 'list-group',
         el: $('#logline-list'),

         initialize: function(){
           this.isLoading = true;
           this.collection = new LogLineCollection();

           this.collection.bind('add', this.addOneLine, this);
           this.collection.bind('all', this.render, this);
           this.collection.bind('reset', this.render, this);
           this.collection.fetch();

           this.collection.each(function(model) { model.destroy(); } );
           Backbone.on("show:file", this.showFile, this);
           Backbone.on("newlogline", this.newLogline, this);
         },

         addLogLine: function(){
           var fileName = this.$('#logline-name').val();
           // console.log('add-logline for file '+ fileName);
           this.collection.create({name: fileName});
         },

         addOneLine: function(logline) {
           // Should it scroll and animate when added
           var isAnimated = false;
           if (this.$el.height() - $('#log-container')[0].scrollTop < $('#log-container').height()){
             isAnimated = true;
           }

           var view = new LogLineView({model: logline});
           this.toggleLogLoading(false);

           this.$el.append(view.render().el);
           if (isAnimated)
             $('#log-container').animate({"scrollTop": $('#log-container')[0].scrollHeight}, "fast");
           this.counter++;
         },

         addAllLines: function() {
           this.$el.html('');
           this.collection.each(this.addOneLine, this);
         },

         filterLogLine: function(){
           console.log('filter event');
         },

         showFile: function(){
           var f = $('#logline-name').text();
           console.log('filter event', f);
           var allFiles = new LogLineCollection();
           allFiles.fetch();
           console.log('allFiles: ', allFiles.where({name: f}));
           console.log(this.collection.toJSON());
           this.collection.reset(allFiles.where({name: f}));
           console.log(this.collection.toJSON());
           this.addAllLines();
         },

         removeLogs: function(){
           this.collection.each(function(model) { model.destroy(); } );
           this.toggleLogLoading(true);
         },

         newLogline: function(logline){
           // console.log('newLogline callback: ', logline);
           this.collection.add(logline);
         },

         toggleLogLoading: function(toggleValue){
           this.isLoading = toggleValue;
           if (!this.isLoading){
             $('.log-loader').hide();
           }
           else{
             $('.log-loader').show();
           }             
         }

       });

       var FileListView = Backbone.View.extend({
         tagName: 'div',
         className: 'list-group',
         el: $('#file-list'),

         events:{
           "click #add-file": "addFile",
           "click #remove-files": "removeFiles",
           "click #add-logline": "addLogLine"
         },

         initialize: function(){
           this.counter = 0;
           this.collection = new FileCollection();
           this.collection.bind('add', this.addOne, this);
           this.collection.bind('reset', this.addAll, this);
           this.collection.bind('all', this.render, this);

           // Delete any old cached items
           this.collection.fetch();
           this.collection.each(function(model) { model.destroy(); } ) ;

           Backbone.on("newfile", this.newFile, this);
         },

         addFile: function(){
           // console.log('add-file clicked...');
           var fileName = 'add-file' + this.counter + '.log';
           this.collection.create({name: fileName});
         },

         addOne: function(file) {
             console.log('adding file from collection...', file);
           var view = new FileView({model: file});
           this.$el.append(view.render().el);
           this.counter++;
         },

         // Add all items in the **this.collection** collection at once.
         addAll: function() {
           this.collection.each(this.addOne, this);
         },

         removeFiles: function(){
           this.collection.each(function(model) { model.destroy(); } );
         },

         newFile: function(files){
           // console.log('newFile callback:', files);
           var c = this.collection;
           _.each(files, function(file){
             // console.log('file: ', file.name);
             c.add(file);
           });
           Backbone.trigger('toggleAppLoading', false);
         }
       });



       var API_ENDPOINT = 'http://localhost:3001';

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
           console.debug('initializing app view...');
           this.isAppLoading = true;
            
           Backbone.trigger('toggleAppLoading', false);
           var s = io.connect(API_ENDPOINT + '/client');

           console.log('socket: ', s);

           s.on('connect', function(){
             console.log('connected to s');
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
             // console.log('got log', data);
             Backbone.trigger("newlogline", data);
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

// new App;
console.debug('test');
