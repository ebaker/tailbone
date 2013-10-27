define(['underscore', 'backbone', 'models/file'], function(_, Backbone, FileModel){
  var FileCollection = Backbone.Collection.extend({
    model: FileModel,
    
    //localStorage: new Store('files-store')
    url: function() { return "/files"; }
  });
  return FileCollection;
});