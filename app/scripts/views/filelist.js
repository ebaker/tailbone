define(['jquery', 'underscore', 'backbone', 'collections/files', 'views/file'],
       function($, _, Backbone, FileCollection, FileView){
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
             // console.log('adding file from collection...');
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
         return FileListView;
       });