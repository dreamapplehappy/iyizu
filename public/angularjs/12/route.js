angular.module("MyApp", ["ngRoute"])
.config(["$routeProvider", function($routeProvider){
	$routeProvider
	.when('/',{
		templateUrl: "views/index.html",
		controller: "IndexController"
	});
	
}])
.controller("IndexController", ["$scope", function($scope){
	$scope.name = "dreamapple";
}]);