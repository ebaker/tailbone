define(['jquery', 'underscore', 'backbone', 'collections/loglines', 'views/logline'],
       function ($, _, Backbone, LogLineCollection, LogLineView){
         var LogView = Backbone.View.extend({
           tagName: 'ul',
           className: 'list-group',
           el: $('#logline-list'),

           initialize: function(){
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
           },

           newLogline: function(logline){
             // console.log('newLogline callback: ', logline);
             this.collection.add(logline);
           }

         });
         return LogView;
       });