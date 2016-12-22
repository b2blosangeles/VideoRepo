app.controller('homePageController', function($rootScope, $scope, $routeParams, $location, $http, $cookies, $timeout, $interval, $sce){ 
	if ($routeParams.vid) $scope.$parent.main_video_id = $routeParams.vid;
	$scope.$parent.page_code = "home";

	$scope.setViewStyle = function(v) {
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + 36500);
		$cookies.put('myFavorite', v, {'expires': expireDate});
		$scope.view_style = v;	
	};
	
	$scope.viewItemShow = function(v) {
		var favoriteCookie = $cookies.get('myFavorite');
		if (!$scope.view_style) $scope.view_style = (favoriteCookie)?favoriteCookie:'list';
		if ($scope.view_style == v) return true;
		else return false;
	}	
});