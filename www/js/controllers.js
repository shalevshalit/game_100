angular.module('game100.controllers', [])

  .controller('MainCtrl', function ($scope, $state) {

  })

  .controller('HomeCtrl', function ($scope) {
    $scope.sendMail = function () {
      if (window.cordova)
        window.plugins.emailComposer.showEmailComposerWithCallback(function () {

        }, 'Contact about 100 game', '', 'shalevshalit@gmail.com');
      else
        window.open('mailto:shalevshalit@gmail.com')
    }
  })

  .controller('BoardCtrl', function ($scope, $timeout, $ionicPopup, $state) {
    $scope.number = 1;
    $scope.lengthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    $scope.oldCords = [];
    $scope.oldRedo = [];
    $scope.checkLose = null;

    $scope.alertRestart = function (onConfirm, skipConfirm) {
      if ($scope.number > 1 && !skipConfirm)
        $ionicPopup.confirm({
          title: 'Exit Game',
          template: 'Are you sure you want to leave the game?'
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

    $scope.setCurrent = function (x, y, redo) {
      $timeout.cancel($scope.checkLose);
      $scope.oldCords.push($scope.currentX + ',' + $scope.currentY);
      $scope.oldRedo.push(redo);

      $scope.currentX = x;
      $scope.currentY = y;
      $scope.checkLose = $timeout(function () {
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
      $timeout.cancel($scope.checkLose);
      if ($scope.number > 1) {
        var oldCord = $scope.oldCords.pop().split(',');

        $scope.currentX = +oldCord[0];
        $scope.currentY = +oldCord[1];
        $scope.oldRedo.pop()();
        $scope.number--;
      }
    };

    $scope.restart = function (skipConfirm) {
      $scope.alertRestart(function () {
        $timeout.cancel($scope.checkLose);
        if ($scope.number > 1) {
          $scope.currentX = null;
          $scope.currentY = null;
          $scope.oldCords = [];
          $scope.oldRedo.forEach(function (redo) {
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

          return aX > 0 && aX <= 10 && aY > 0 && aY <= 10 && $scope.oldCords.indexOf(aX + ',' + aY) == -1;
        })
    };

    $scope.jumpable = function (x, y) {
      if ($scope.currentX && $scope.currentY)
        return ($scope.currentX == x && Math.abs($scope.currentY - y) == 3) ||
          ($scope.currentY == y && Math.abs($scope.currentX - x) == 3) ||
          (Math.abs($scope.currentX - x) == 2 && Math.abs($scope.currentY - y) == 2);
      else
        return true;
    }
  }
)

  .controller('ColCtrl', function ($scope) {
    $scope.init = function (x, y) {
      $scope.x = x;
      $scope.y = y;
    };

    $scope.setNumber = function () {
      if ($scope.isClickable())
        $scope.colNumber = $scope.$parent.setCurrent($scope.x, $scope.y, $scope.redo);
    };

    $scope.redo = function () {
      $scope.colNumber = null;
    };

    $scope.isClickable = function () {
      return !$scope.colNumber && $scope.$parent.jumpable($scope.x, $scope.y);
    }
  });
