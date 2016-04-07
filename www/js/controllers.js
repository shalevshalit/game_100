angular.module('game100.controllers', ['pusher-angular'])

  .controller('MainCtrl', function ($scope, $state, $rootScope, $ionicPopup) {
    $scope.sendMail = function () {
      if (window.cordova)
        window.plugins.emailComposer.showEmailComposerWithCallback(function () {

        }, 'Contact about 100 game', '', 'shalevshalit@gmail.com');
      else
        window.open('mailto:shalevshalit@gmail.com')
    };

    if (ionic.Platform.isAndroid() && !window.cordova && false) // TODO TODO
      $ionicPopup.confirm({
        title: 'Download App?'
      }).then(function (res) {
        if (res)
          window.open('https://play.google.com/store/apps/details?id=com.ionicframework.game100559923');
      });

    $scope.openClassic = function () {
      $rootScope.winNumber = 100;
      $rootScope.level = null;
      $rootScope.currentLvl = null;
      $state.go('board');
    };
    $rootScope.maxChapter = Ionic.User.current().get('maxChapter', 1);
  })

  .controller('SessionCtrl', function ($scope, $state, $ionicPopup) {
    $scope.newUser = {};

    $scope.registerPush = function () {
      var push = new Ionic.Push({
        badge: false,
        sound: true,
        alert: true
      });

      push.register(function (token) {
        push.saveToken(token);
      });
    };

    var signupErrors = {
      required_email: 'Missing E-mail field',
      required_password: 'Missing Password field',
      conflict_email: 'A User has already signed up with the supplied e-mail.',
      conflict_username: 'A User has already signed up with the supplied username.',
      invalid_email: 'The e-mail did not pass validation.'
    };

    $scope.signup = function () {
      Ionic.Auth.signup($scope.newUser).then($scope.login,
        function (data) {
          var error = data.errors.map(function (err) {
            return signupErrors[err];
          }).join("<br>");
          $ionicPopup.alert({
            title: 'Sign Up error',
            template: error
          });
        });
    };

    $scope.login = function (type) {
      Ionic.Auth.login(type || 'basic', {remember: true}, $scope.newUser)
        .then(function () {
          $scope.registerPush();

          var user = Ionic.User.current();

          if (user.get('seenHelp'))
            $state.go('home');
          else {
            $state.go('help');
            user.set('seenHelp', true);
            user.save();
          }
        }, function (data) {
          $ionicPopup.alert({
            title: 'Bad Login',
            template: data.response.body.error.message

          });
        });
    };
  })

  .controller('BoardCtrl', function ($scope, $timeout, $ionicPopup, $pusher, $state, $http, $stateParams,
                                     $ionicLoading, $rootScope, $ionicScrollDelegate, $cordovaSocialSharing) {
    var me = this;

    $scope.number = 1;
    me.oldCords = [];
    me.oldRedo = [];
    me.checkLose = null;

    if (!$rootScope.gameId)
      $rootScope.players = {};

    $rootScope.$on('$stateChangeSuccess', function (event, state) {
      $ionicScrollDelegate.scrollTop();
      if (state.name == 'pickLvl')
        $timeout(function () {
          if (!$rootScope.levels['lvl' + $rootScope.maxLvl])
            $ionicScrollDelegate.scrollBottom();
          else {
            var maxLvlTop = document.getElementById('lvl-list').children[$rootScope.maxLvl - 1].getBoundingClientRect().top - 50; // - header
            $ionicScrollDelegate.scrollTo(0, maxLvlTop, true);
          }
        }, 400);
      else if (state.name == 'board')
        $scope.restart(true);
    });

    $scope.openLvl = function (lvl) {
      if (!lvl.i || lvl.i <= $rootScope.maxLvl) {

        $rootScope.level = lvl.board;
        $rootScope.winNumber = lvl.winNumber;
        $rootScope.currentLvl = lvl.i;
        $state.go('board');
      }
    };

    $scope.openChapter = function (chapter) {
      if (chapter <= $rootScope.maxChapter) {
        $rootScope.currentChapter = chapter;

        $http.get('levels/chapter' + chapter + '.json').success(function (data) {
          $rootScope.maxLvl = Ionic.User.current().get('chapter' + chapter + 'maxLvl', 1);
          $rootScope.levels = data;
        });

        $state.go('pickLvl');
      }
    };

    $scope.startGame = function () {
      var pusher = $pusher(new Pusher('3f0fe5289bb11eea2977'));
      $rootScope.channel = pusher.subscribe('moves');
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
        $rootScope.currentLvl ? $scope.lvlWinPop() : $scope.winPop();

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
      var chapterDone = false;
      if ($rootScope.currentLvl == $rootScope.maxLvl) {
        var user = Ionic.User.current();
        user.set('chapter' + $rootScope.currentChapter + 'maxLvl', ++$rootScope.maxLvl);
        if ($rootScope.currentChapter == $rootScope.maxChapter && !$rootScope.levels['lvl' + $rootScope.maxLvl]) {
          user.set('maxChapter', ++$rootScope.maxChapter);
          chapterDone = true;
        }
        user.save();
      }

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
              if (chapterDone)
                $scope.openChapter($rootScope.maxChapter);
              else
                $scope.openLvl($rootScope.levels['lvl' + ($rootScope.currentLvl + 1)]);
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

    $scope.shareBoard = function () {
      $ionicLoading.show({
        template: 'Loading...'
      });

      var board = Array.apply(null, Array(100)).map(function () {
        return 0
      });

      me.oldCords.forEach(function (cord) {
        cord = cord.split(',');
        if (+cord[0] && +cord[1])
          board[(+cord[0] - 1) * 10 + +cord[1] - 1] = 1;
      });
      board[($scope.currentX - 1) * 10 + $scope.currentY - 1] = 1;

      var link = 'https://game100api.herokuapp.com/boards/custom/' + board.join('');

      if (window.cordova)
        $cordovaSocialSharing
          .share(null, null, null, link)
          .then(function () {
            $ionicLoading.hide();
          }, function () {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Share error',
              template: 'The board could not be shared'
            });
          });
      else {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Share link',
          template: '<a href="mailto:someone@example.com?Subject=' + link + '">Click here to Share!</a>'
        });
      }
    };

    if ($stateParams.board) {
      var board = [],
        winNumber = 0;

      $stateParams.board.split('').forEach(function (col, i) {
        if (i < 10)
          board[i % 10] = [];
        board[i % 10][Math.floor(i / 10)] = +col;
        if (+col)
          winNumber++;
      });

      $scope.openLvl({board: board, winNumber: winNumber});
    }
    $scope.scoreEl = document.getElementById('score');
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
