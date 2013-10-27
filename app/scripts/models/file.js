define(['underscore', 'backbone'], function(_, Backbone){
  var FileModel = Backbone.Model.extend({
    defaults: function(){
      return {
        name: 'undefined file'
        };
    }
  });
  return FileModel;
});