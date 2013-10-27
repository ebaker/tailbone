define(['underscore', 'backbone', 'models/logline'], function(_, Backbone, LogLineModel){
  var LogLineCollection = Backbone.Collection.extend({
    model: LogLineModel,
    
    // localStorage: new Store('loglines-store')
    url: function() { return "/loglines"; }
  });
  return LogLineCollection;
});