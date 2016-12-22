var app = angular.module('videoRepo', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $interval, $sce){ 
	$rootScope.serverName = 'http://vr.qalet.com';
	$scope.list = {};
	$scope.$watch(
 		function () {
                	return {main_video_id:$scope.main_video_id,list:$scope.list, page_code:$scope.page_code, 
				list_time:$scope.list_time};
            	},		
		function (newValue, oldValue, scope) {
	    		if (newValue) {
				if ((newValue.main_video_id) && (newValue.list)) {
					for (var i=0; i<newValue.list.length; i++) {
						if (newValue.list[i].vid == newValue.main_video_id) {
							$scope.switchVideo(newValue.list[i]);
							break;
						}
					}		
				} else if (!newValue.main_video_id && (newValue.list) ) {
					$scope.switchVideo();
				}
			};
		}, 
		true);

	$scope.checkActive = function(v) {
		if ((v) == $scope.page_code) return 'active';
		// if (('/'+v) == $location.path()) return 'active';
	};
	
	$scope.$on('$routeChangeStart', function(next, current) { 
		if ($("#main_video")) {
			$("#main_video").hide().appendTo('body');
		}
		$interval.cancel($rootScope.stop);
	 });

	$scope.dynamic_img = {};
	$interval(
		function() {
			var n = $scope.list.length;
			if (!n) return true;
			if (!$scope.dynamic_img_n || $scope.dynamic_img_n >= $scope.list.length) $scope.dynamic_img_n = 0;
			$scope.dynamic_img[$scope.list[$scope.dynamic_img_n].vid] = Math.floor(Math.random()*10);
			$scope.dynamic_img_n++;
		},
		1000
	);
	$scope.itemImage = function(rec, idx) {
		if (typeof idx=='undefined') {
			var idx = rec.defaultThumbnail;
		}
		var v=(idx === '')?(($scope.dynamic_img[rec.vid])?$scope.dynamic_img[rec.vid]:0):idx;
		return $rootScope.serverName + '/api/streamFile.js?file=' + rec.vid + '_' + v +  '.png';
	};
	
	$scope.styleSideVideo = function() {
		if (!$scope.main_video) {
			return {display:'none'}	
		} else {
			return {display:''}	
		}
	};	
	$scope.timestampToDateTime = function(v) {
		return moment(v).format("MM-DD-YYYY h:mm:ss");
		//return new Date(v).toString();
	};
	$scope.switchVideo= function(item) {
		if (item) {
			$scope.main_video = item;
			var my_video = $("#main_video")[0];
			if (my_video) {
				if (!my_video.paused) my_video.pause();
				if ($scope.$parent.main_video_id != item.vid) {
					my_video.src = $rootScope.serverName +'/api/streaming.js?vid='+item.vid+'.mp4'; 
					$scope.$parent.main_video_id = item.vid;
				}
				
				$("#main_video").appendTo("#video_frame");
				if (my_video) my_video.width=$("#main_video").parent().width();
				if ((my_video) && ($scope.main_video)) {
					$("#main_video").show();
					my_video.play();
				} else {
					$("#main_video").hide();
				};	

			}	
		} else {
			$("#main_video").hide();
		}
	};

	$scope.stopVideo = function() {
		delete $scope.$parent.main_video;
		delete $scope.$parent.main_video_id;
		delete $scope.main_video;
		delete $scope.main_video_id;		
		$("#main_video")[0].pause();
		$("#main_video")[0].src = '';
		$("#main_video").hide();
	};
	
	$scope.infoPreview = function(item) {
		$scope.c_item = item;
	};	
	
	$scope.loadList = function() {
		$http({
		  method: 'GET',
		  url: $rootScope.serverName + '/api/youtube.js?opt=getAll&TM=' + new Date().toString()
		}).then(function successCallback(response) {
			$scope.list = response.data;	
			$scope.list_time = new Date();
		  }, function errorCallback(response) {
			//console.log(response);
			});		
	};
	$scope.loadList();
	socket.download_result = function(data) {
		if (data.t == 'success') {
			$scope.loadList();
		}
	};	
});	

app.config(function($routeProvider) {
	$routeProvider.when('/',   {template: _TPL_['view/page_home.html'], reloadOnSearch: false, controller:'homePageController'});
	$routeProvider.when('/home/:vid',   {template:_TPL_['view/page_home.html'], reloadOnSearch: false, controller:'homePageController'});	
	$routeProvider.when('/admin',   {template:_TPL_['view/page_admin.html'],  reloadOnSearch: false, controller:'adminController'});
	$routeProvider.when('/video',   {template:_TPL_['view/page_video.html'], reloadOnSearch: false, controller:'mainVideoController'});
});

app.controller('mainVideoController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $interval, $sce){ 
	if ($location.path() == '/video' && !$scope.main_video) {
		$location.path("/");
		return true;
	}	
	$scope.$parent.page_code = "video";		
});