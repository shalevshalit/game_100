angular.module('game100.directives', ['ionic'])

  .directive('introHelp', function ($ionicBackdrop, $state) {
    return {
      restrict: 'E',
      template: '<div class="bar bar-header bar-calm header-dark-wood top-col">\
        <button class="button button-icon icon ion-home" ng-click="goHome()"></button>\
        <div class="h1 title">100</div>\
        <button class="button button-clear" ng-click="exitIntro()">Skip</button>\
    </div>\
       <div class="card absolute-card">\
          <div class="item item-text-wrap">\
          {{helps[helpLvl]["text"]}}\
          </div>\
      </div>\
      <div class="board-col calm-border top-col" ng-style="getHelpDimension()" ng-click="nextHelp()">\
       <div class="board-col-inner">\
        <i class="icon button-balanced clickable ion-ios-circle-filled"></i>\
       </div>\
      </div>',
      link: function (scope, element) {
        scope.helpLvl = 0;
        scope.helps = [
          {
            text: 'Click on the box with a green dot to start the level',
            element: 'col3-6'
          },
          {
            text: 'Click on available box until you click them all',
            element: 'col6-6'
          }
        ];

        scope.getBoxElement = function () {
          return document.getElementById(scope.helps[scope.helpLvl]["element"]);
        };

        scope.getHelpDimension = function () {
          var realElem = scope.getBoxElement();

          if (realElem) {
            var dimensions = realElem.getBoundingClientRect();
            return {
              left: dimensions.left + 'px',
              top: dimensions.top + 'px',
              width: realElem.offsetWidth + 'px',
              height: realElem.offsetHeight + 'px'
            };
          }
          else
            return {visability: 'hidden'}
        };

        scope.nextHelp = function () {
          angular.element(scope.getBoxElement()).scope().setNumber();
          if (scope.helpLvl + 1 == scope.helps.length)
            scope.exitIntro();
          else
            scope.helpLvl++;
        };

        scope.goHome = function () {
          scope.helpLvl = 0;
          scope.exitIntro(true);
          $state.go('home');
        };

        scope.exitIntro = function (skipSeen) {
          element[0].className = '';
          $ionicBackdrop.release();

          if (!skipSeen) {
            var user = Ionic.User.current();

            user.set('seenIntro', true);
            user.save();
          }
        };
      }
    }
  })

  .directive('board', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      template: '<div class="board-row" ng-repeat="x in lengthArray">\
      <div class="board-col calm-border"\
       ng-class="{\'clicked\': colNumber,\'hidden-col\': level && !level[y-1][x-1],\'multi-player\': multiplayer, \'enemy\': enemy}"\
       ng-repeat="y in lengthArray"\
       id="col{{x}}-{{y}}"\
       ng-controller="ColCtrl"\
       ng-init="init(x,y)"\
       ng-click="(!level || level[y-1][x-1]) && setNumber()">\
         <div class="board-col-inner">\
           <div>{{colNumber}}</div>\
           <i ng-show="isClickable()" class="icon button-balanced clickable ion-ios-circle-filled"></i>\
         </div>\
        </div>\
      </div>',
      link: function (scope) {
        scope.lengthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      }
    }
  });
