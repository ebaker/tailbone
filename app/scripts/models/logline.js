define(['underscore', 'backbone'], function(_, Backbone){
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
  return LogLineModel;
});