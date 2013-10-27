define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
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
  return FileView;
});