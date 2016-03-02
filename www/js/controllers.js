angular.module('game100.controllers', ['pusher-angular'])

  .controller('MainCtrl', function ($scope, $state, $rootScope, $ionicPopup) {
    $scope.sendMail = function () {
      if (window.cordova)
        window.plugins.emailComposer.showEmailComposerWithCallback(function () {

        }, 'Contact about 100 game', '', 'shalevshalit@gmail.com');
      else
        window.open('mailto:shalevshalit@gmail.com')
    };

    if (ionic.Platform.isAndroid())
      $ionicPopup.confirm({
        title: 'Download App?'
      }).then(function (res) {
        if (res)
          window.open('https://play.google.com/store/apps/details?id=com.ionicframework.game100559923');
      });

    $scope.openClassic = function () {
      $rootScope.winNumber = 100;
      $rootScope.level = null;
      $state.go('board');
    }
  })

  .controller('BoardCtrl', function ($scope, $timeout, $ionicPopup, $state, $http, $ionicLoading, $rootScope) {
    var me = this;

    $scope.number = 1;
    me.oldCords = [];
    me.oldRedo = [];
    me.checkLose = null;
    $http.get('levels/chapter1.json').success(function (data) {
      $rootScope.maxLvl = window.localStorage.maxLvl || 1;
      $rootScope.levels = data;
    });
    $scope.scoreEl = document.getElementById('score');
    if (!$rootScope.gameId)
      $rootScope.players = {};

    $scope.openLvl = function (lvl) {
      $rootScope.level = lvl.board;
      $rootScope.winNumber = lvl.winNumber;
      $rootScope.currentLvl = lvl.i;
      $state.go('board');
    };

    $scope.startGame = function () {
      $ionicLoading.show({
        template: 'Loading...'
      });

      $http({
        url: 'http://game100api.herokuapp.com/games/create',
        method: "POST",
        withCredentials: true,
        data: $rootScope.players
      }).success(function (data) {
        var gameData = data.game;
        $rootScope.gameId = gameData['id'];

        $rootScope.multiplayer = true;
        if (gameData['started']) {
          $ionicLoading.hide();
          $rootScope.yourTurn = gameData['player1'] == $rootScope.players['player1'];
          $state.go('multiplayer-board');
        } else {
          $ionicLoading.show({
            template: '<div>Waiting for opponenet...</div>' +
            '<button class="button cancel-button" ng-click="cancelMultiplayer()">Cancel</button>',
            scope: $scope
          });
          $rootScope.channel.bind($scope.getGameName(), function (data) {
            if (data['started']) {
              $rootScope.gameId = data['id'];
              $rootScope.yourTurn = true;
              $rootScope.channel.unbind($scope.getGameName());
              $state.go('multiplayer-board');
              $ionicLoading.hide();
            }
          });
        }
      });
    };

    $scope.cancelMultiplayer = function () {
      $rootScope.channel.unbind($scope.getGameName());
      $ionicLoading.hide();
    };

    $scope.getGameName = function () {
      return 'move' + $rootScope.gameId;
    };

    $scope.alertRestart = function (onConfirm, skipConfirm) {
      if ($scope.number > 1 && !skipConfirm)
        $ionicPopup.confirm({
          title: 'Reset Game',
          template: 'Are you sure you want to reset the game?'
        }).then(function (res) {
          if (res)
            onConfirm();
        });
      else
        onConfirm();
    };

    $scope.goHome = function () {
      $scope.alertRestart(function () {
        $scope.restart(true);
        $state.go('home');
      });
    };

    $scope.sendMove = function (x, y, redo) {
      $timeout.cancel(me.checkLose);
      if ($rootScope.multiplayer)
        $http({
          url: 'http://game100api.herokuapp.com/games/move',
          method: "POST",
          withCredentials: true,
          data: {id: $rootScope.gameId, x: x, y: y}
        }).success(function () {
          $scope.setCurrent(x, y, redo);
        });
      else
        $scope.setCurrent(x, y, redo);

      return $scope.number - 1;
    };

    $scope.setCurrent = function (x, y, redo) {
      $scope.setEnemyTurn();
      var won = $scope.number == $rootScope.winNumber;
      if (won)
        $rootScope.level ? $scope.lvlWinPop() : $scope.winPop();

      me.oldCords.push($scope.currentX + ',' + $scope.currentY);
      me.oldRedo.push(redo);

      $scope.currentX = x;
      $scope.currentY = y;

      if (!won)
        me.checkLose = $timeout(function () {
          if (!$scope.anyJumpable() && $state.current.name == 'board')
            $ionicPopup.show({
              title: 'No Available Moves!',
              subTitle: 'You have no moves left with ' + ($scope.number - 1) + ' blocks!',
              cssClass: 'wider-popup',
              buttons: [
                {
                  text: 'Home',
                  type: 'popup-button icon ion-home',
                  onTap: function () {
                    $state.go('home');
                  }
                },
                {
                  text: 'Revert',
                  type: 'popup-button icon ion-arrow-return-left',
                  onTap: $scope.revert
                },
                {
                  text: 'Restart',
                  type: 'popup-button icon ion-refresh',
                  onTap: $scope.restart
                }
              ]
            });
        }, 1000);

      return $scope.number++;
    };

    $scope.revert = function () {
      $timeout.cancel(me.checkLose);
      if ($scope.number > 1) {
        var oldCord = me.oldCords.pop().split(',');

        $scope.currentX = +oldCord[0];
        $scope.currentY = +oldCord[1];
        me.oldRedo.pop()();
        $scope.number--;
      }
    };

    $scope.winPop = function () {
      var pop = $ionicPopup.show({
        title: 'You Won!',
        subTitle: 'Congratulations! You have won the game!',
        cssClass: 'wider-popup',
        buttons: [
          {
            text: 'Home',
            type: 'popup-button icon ion-home',
            onTap: function () {
              $state.go('home');
            }
          },
          {
            text: 'Restart',
            type: 'popup-button icon ion-refresh',
            onTap: $scope.restart
          },
          {
            text: 'Close',
            type: 'popup-button icon ion-close-round',
            onTap: function () {
              pop.close();
            }
          }
        ]
      });
    };

    $scope.lvlWinPop = function () {
      if ($rootScope.currentLvl == $rootScope.maxLvl)
        window.localStorage.maxLvl = ++$rootScope.maxLvl;

      $ionicPopup.show({
        title: 'Level ' + ($scope.currentLvl),
        subTitle: 'You won the level!',
        cssClass: 'wider-popup',
        buttons: [
          {
            text: 'Home',
            type: 'popup-button icon ion-home',
            onTap: function () {
              $state.go('home');
            }
          },
          {
            text: 'Next Level',
            type: 'popup-button icon ion-arrow-right-a',
            onTap: function () {
              $scope.restart(true);
              $scope.openLvl($rootScope.levels['lvl' + ($rootScope.currentLvl + 1)])
            }
          }
        ]
      });
    };

    $scope.restart = function (skipConfirm) {
      $scope.alertRestart(function () {
        $timeout.cancel(me.checkLose);
        if ($scope.number > 1) {
          $scope.currentX = null;
          $scope.currentY = null;
          me.oldCords = [];
          me.oldRedo.forEach(function (redo) {
            redo();
          });
          $scope.number = 1;
        }
      }, skipConfirm);
    };

    $scope.anyJumpable = function () {
      var x = $scope.currentX,
        y = $scope.currentY;

      return [
        [x + 3, y], [x - 3, y], [x, y + 3], [x, y - 3],
        [x - 2, y - 2], [x + 2, y - 2], [x - 2, y + 2], [x + 2, y + 2]
      ].some(function (cords) {
          var aX = cords[0],
            aY = cords[1];

          return aX > 0 && aX <= 10 && aY > 0 && aY <= 10 && (!$rootScope.level || $rootScope.level[aY - 1][aX - 1]) && me.oldCords.indexOf(aX + ',' + aY) == -1;
        })
    };

    $scope.jumpable = function (x, y) {
      if ($scope.currentX && $scope.currentY)
        return ($scope.currentX == x && Math.abs($scope.currentY - y) == 3) ||
          ($scope.currentY == y && Math.abs($scope.currentX - x) == 3) ||
          (Math.abs($scope.currentX - x) == 2 && Math.abs($scope.currentY - y) == 2);
      else
        return true;
    };

    $scope.isYourTurn = function () {
      return $rootScope.yourTurn;
    };

    $scope.setEnemyTurn = function (turn) {
      $rootScope.yourTurn = (turn === true);
    };
  })

  .controller('ColCtrl', function ($scope, $rootScope) {
    $scope.init = function (x, y) {
      $scope.x = x;
      $scope.y = y;
    };

    $scope.setNumber = function () {
      if ($scope.isClickable())
        $scope.colNumber = $scope.$parent.sendMove($scope.x, $scope.y, $scope.redo);
    };

    $scope.redo = function () {
      $scope.colNumber = null;
    };

    $scope.isClickable = function () {
      return (!$rootScope.multiplayer || $scope.$parent.isYourTurn()) && !$scope.colNumber && $scope.$parent.jumpable($scope.x, $scope.y);
    };

    if ($rootScope.multiplayer)
      $rootScope.channel.bind($scope.$parent.getGameName(), function (data) {
        if (data.x == $scope.x && data.y == $scope.y && !$scope.colNumber) {
          $scope.enemy = true;
          $scope.colNumber = $scope.$parent.setCurrent(data.x, data.y, $scope.redo);
          $scope.$parent.setEnemyTurn(true);
        }
      }, $scope, false);
  });
