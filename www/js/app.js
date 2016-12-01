// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.constant','ngStorage'])


.run(function($ionicPlatform, model, $timeout, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    model.init();
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $ionicConfigProvider.tabs.position('top');
  
  $stateProvider
  
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })
    
  .state('tab.voyages', {
      url: '/voyages',
      views: {
        'tab-voyages': {
          templateUrl: 'templates/tab-voyages.html',
          controller: 'VoyagesCtrl'
        }
      }
    })
    .state('tab.voyages-detail', {
      url: '/voyages/:voyagesId',
      views: {
        'tab-voyages': {
          templateUrl: 'templates/voyages-detail.html',
          controller: 'VoyagesDetailCtrl'
        }
      }
    })
    .state('tab.participants-detail', {
      url: '/participants/:voyagesId/:participantsId',
      views: {
        'tab-voyages': {
          templateUrl: 'templates/participants-detail.html',
          controller: 'ParticipantsDetailCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/voyages');

});