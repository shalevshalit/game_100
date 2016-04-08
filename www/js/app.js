// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('game100', ['ionic', 'ionic.service.core', 'ionic.service.analytics', 'ngCordova',
  'game100.controllers', 'game100.directives', 'pusher-angular'])

  .run(function ($ionicPlatform, $ionicAnalytics, $rootScope, $state) {
    $ionicPlatform.ready(function () {
      $ionicAnalytics.register({silent: true});

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

    window.handleOpenURL = function (url) {
      $state.go('customLvl', {board: url.slice(16)});
    };
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    var user = Ionic.User.current();

    if (user.isAuthenticated())
      $urlRouterProvider.otherwise('/');
    else
      $urlRouterProvider.otherwise('/login');


    $stateProvider

      .state('home', {
        url: '/',
        templateUrl: 'templates/home.html'
      })

      .state('signup', {
        url: '/signup',
        templateUrl: 'templates/registration/signup.html',
        controller: 'SessionCtrl'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/registration/login.html',
        controller: 'SessionCtrl'
      })

      .state('board', {
        url: '/board',
        templateUrl: 'templates/board.html',
        controller: 'BoardCtrl'
      })

      .state('customLvl', {
        url: '/customlvl/:board',
        templateUrl: 'templates/home.html',
        controller: 'BoardCtrl'
      })

      .state('pickChapter', {
        url: '/pickchapter',
        templateUrl: 'templates/pick-chapter.html',
        controller: 'BoardCtrl'
      })

      .state('pickLvl', {
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
        templateUrl: 'templates/help.html',
        controller: 'HelpCtrl',
      });
  });
