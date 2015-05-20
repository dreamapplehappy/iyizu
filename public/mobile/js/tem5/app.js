angular.module('starter', ['ionic'])
.controller("MyController", function($scope) {
	$scope.shouldShowDelete = false;
 	$scope.shouldShowReorder = false;
 	$scope.listCanSwipe = true
    $scope.lists = [
    	{	status: "new", content: "I need to do1"},
    	{	status: "new", content: "I need to do2"},
    	{	status: "new", content: "I need to do3"},
    	{	status: "new", content: "I need to do4"}
    ];
    $scope.add = function(){
    	var todo = {};
    	todo.status = "new";
    	todo.content = $scope.thing;
    	$scope.lists.push(todo);
    }
    $scope.remove = function(){

    }

});