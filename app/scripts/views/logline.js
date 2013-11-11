define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
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
  return LogLineView;
});