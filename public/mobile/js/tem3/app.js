angular.module('starter', ['ionic'])
.controller("MyController", function($scope, $ionicActionSheet, $timeout) {

  $scope.msg = "这里会有一些变化！";
 // Triggered on a button click, or some other target
 $scope.show = function() {

   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '分享' },
       { text: '移动' }
     ],
     destructiveText: '删除',
     titleText: '操作你的弹出框',
     cancelText: '取消',
     cssClass: '',
     cancel: function() {
          $scope.msg = "取消！";
          return true;
        },
     buttonClicked: function(index) {
        switch(index){
          case 0: {$scope.msg = "选项卡0";}; break;
          case 1: {$scope.msg = "选项卡1";}; break;
          default: return true;
        }
     },
     destructiveButtonClicked: function(){
          $scope.msg = "危险";
          return true;
     },
     cancelOnStateChange: function(){
          $scope.msg = "状态变化！";
          return true;
     }

   });

   // For example's sake, hide the sheet after two seconds
   /*$timeout(function() {
     hideSheet();
   }, 2000);*/

 };
});