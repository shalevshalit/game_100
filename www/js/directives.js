angular.module('game100.directives', ['ionic'])

  .directive('board', function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="board-row" ng-repeat="x in lengthArray">\
      <div class="board-col calm-border"\
       ng-class="{\'clicked\': colNumber,\'multi-player\': multiplayer, \'enemy\': enemy}"\
       ng-repeat="y in lengthArray"\
       ng-controller="ColCtrl"\
       ng-init="init(x,y)"\
       ng-click="setNumber()">\
         <div class="board-col-inner">\
           <div>{{colNumber}}</div>\
           <i ng-show="isClickable()" class="icon button-balanced clickable ion-ios-circle-filled"></i>\
         </div>\
        </div>\
      </div>',
      link: function (scope, element) {
        scope.lengthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      }
    }
  });
