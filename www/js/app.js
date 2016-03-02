// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('game100', ['ionic', 'game100.controllers', 'game100.directives', 'pusher-angular'])

  .run(function ($ionicPlatform, $rootScope, $pusher) {
    $ionicPlatform.ready(function () {
      var pusher = $pusher(new Pusher('3f0fe5289bb11eea2977'));
      $rootScope.channel = pusher.subscribe('moves');
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider

      .state('home', {
        url: '/',
        templateUrl: 'templates/home.html'
      })

      .state('board', {
        url: '/board',
        templateUrl: 'templates/board.html',
        controller: 'BoardCtrl'
      })


      .state('picklvl', {
        url: '/picklvl',
        templateUrl: 'templates/pick-level.html',
        controller: 'BoardCtrl'
      })

      .state('multiplayer', {
        url: '/multiplayer',
        templateUrl: 'templates/multiplayer.html',
        controller: 'BoardCtrl'
      })

      .state('multiplayer-board', {
        url: '/multiplayer/board',
        templateUrl: 'templates/multiplayer-board.html',
        controller: 'BoardCtrl'
      })

      .state('help', {
        url: '/help',
        templateUrl: 'templates/help.html'
      });

  });
