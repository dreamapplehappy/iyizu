angular.module("MyApp", ["ngRoute"])
.config(["$routeProvider", function($routeProvider){
	$routeProvider
	.when('/',{
		templateUrl: "views/index.html",
		controller: "IndexController"
	});
	
}])
.factory("githubService", ["$http", function($http){
	var githubUrl = "http://api.github.com";
	var githubUsername;

	var runUserRequest = function(path){
		return $http({
			method: "JSONP",
			url: githubUrl + "/users/" + githubUsername + "/" + path + "?callback=JSON_CALLBACK"
		});
	}

	return {
		events: function(){
			return runUserRequest("events");
		},
		setUsername: function(username){
			githubUsername = username;
		}
	};
}])
.controller("IndexController", ["$scope", function($scope){
	$scope.name = "dreamapple";
}]);