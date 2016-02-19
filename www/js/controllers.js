angular.module('game100.controllers', [])

  .controller('BoardCtrl', function ($scope) {
    $scope.number = 1;
    $scope.lengthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    $scope.oldX = [];
    $scope.oldY = [];
    $scope.oldRedo = [];

    $scope.setCurrent = function (x, y, redo) {
      $scope.oldX.push($scope.currentX);
      $scope.oldY.push($scope.currentY);
      $scope.oldRedo.push(redo);

      $scope.currentX = x;
      $scope.currentY = y;
      return $scope.number++;
    };

    $scope.revert = function () {
      if ($scope.number > 1) {
        $scope.currentX = $scope.oldX.pop();
        $scope.currentY = $scope.oldY.pop();
        $scope.oldRedo.pop()();
        $scope.number--;
      }
    };

    $scope.restart = function () {
      if ($scope.number > 1) {
        $scope.currentX = null;
        $scope.currentY = null;
        $scope.oldRedo.forEach(function (redo) {
          redo();
        });
        $scope.number = 1;
      }
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

  .
  controller('ColCtrl', function ($scope) {
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
