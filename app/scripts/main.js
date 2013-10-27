require.config({
    baseUrl: "scripts",
    paths: {
      "jquery": "vendor/jquery/jquery",
     "underscore": "vendor/underscore-amd/underscore",
     "backbone": "vendor/backbone-amd/backbone",
      //"underscore": "vendor/underscore/underscore",
      // "backbone": "vendor/backbone/backbone",
      "bootstrap": 'vendor/bootstrap/dist/js/bootstrap.min',
      "backbone.localStorage": "vendor/backbone.localStorage/backbone.localStorage",
      "moment": "vendor/moment/moment",
     "socketio": "vendor/socket.io-client/dist/socket.io"
    },
  shim: {
    // underscore: { deps:['jquery'], exports: '_' },
    'bootstrap':{deps: ['jquery']},
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'socketio': {
      exports: 'io'
    }
  }
});

require(['views/app', 'jquery', 'bootstrap'], function(AppView, $, _bootstrap){


  new AppView;
});