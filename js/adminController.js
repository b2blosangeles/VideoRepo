app.controller('adminController', function($rootScope, $scope, $routeParams, $location, $http, $cookies, $timeout, $interval, $sce){ 
	$scope.$parent.page_code = "admin";	
	
	$scope.setAdminItem = function(v, option) {
		$scope._adminItem = v; 
		$scope._adminOption = (option)?option:'default_image'; 
		if (typeof $scope._adminItem.defaultThumbnail == 'undefined') $scope._adminItem.defaultThumbnail = '';
	};	
	
	$scope.popupOn  = function() {
		$('#admin_modal').modal({
		  keyboard: false
		});	
	};
	$scope.popupOff  = function() {
		$('#admin_modal').modal('toggle');	
	};

	$scope.setMoreSection = function(vid) {
		$scope.more_section = vid;
	};	
	
	
	
	/* --- options -----*/
	$scope.admin_options = {
		default_image: 'Setup default Image',
		admin_editor:'Edit information'
	};
	
	
	/* --- add video ----- */
	$scope.videoUrlStyle = function() {
		if ($scope._adminItem) return  {display:'none'};
		else return {display:''}
		
	};
	
	$scope.$watch(
		function() {
			return $scope.videourl;	
		}, function(newV, oldV) {
			if (newV) {
				var M = /youtube\.com\/watch\?v\=([a-zA-Z0-9\_\-]+)(\&|$)/g.exec(newV);
				if (M) {
					$scope.inputedVID = M[1];
				} else {
					delete $scope.inputedVID;	
				}
			} else {
				delete $scope.inputedVID;
			}
		}
	);	
	
	$scope.isExistVID = function() {
		
		for (var i = 0; i < $scope.$parent.list.length; i++) {
			if ($scope.$parent.list[i].vid == $scope.inputedVID) {
				return true;
			}
		}
		return false;
	};
		
	$scope.isSubmitAble = function() {
		if ($scope.isExistVID()) {
			return false
		} else {
			return ($scope.inputedVID);
		}
	};

	$scope.submitAddVid = function() {
		$http({
		  method: 'POST',
		  url: $rootScope.serverName + '/api/youtube.js?opt=add',
		  data: {vid:$scope.inputedVID}	
		}).then(function successCallback(response) {
			// $scope.$parent.loadList();
			console.log(response);
			delete $scope.inputedVID;
			delete $scope.videourl;
			$scope.firstTimeCronJob();
		  }, function errorCallback(response) {
			console.log(response);
			});		 		
	};		

	$scope.firstTimeCronJob = function() {
		$scope.$parent.loadList();
		return true;
		$http({
		  method: 'GET',
		  url: $rootScope.serverName + '/api/cron_download_youtube.js',
		}).then(function successCallback(response) {
			console.log(response);
			$scope.$parent.loadList();
		  }, function errorCallback(response) {
			console.log(response);
			});		 		
	};
	
	/* --- delete video ----- */
	$scope.deleteVideo = function(item) {
		$scope.item_need_delete = item;
		$scope.popup_module = 'delete';
		$scope.popupOn();
	};

	$scope.turnOffDelete = function() {
		delete $scope.item_need_delete;
		$scope.popup_module = '';
		$scope.popupOff();
	};	
	
	$scope.deleteRec = function() {
		$http({
		  method: 'POST',
		  url: $rootScope.serverName + '/api/youtube.js',
		  data: {opt:'delete', vid:$scope.item_need_delete.vid}	
		}).then(function successCallback(response) {
			$scope.$parent.loadList();
			$scope.turnOffDelete();
		  }, function errorCallback(response) {
			console.log(response);
			$scope.turnOffDelete();
			});
	};
	
	
	/* --- Default Thumbnail Process ----- */
	
	$scope.$watch(
		function() {
			if (!$scope._adminItem) return false;
			return $scope._adminItem.defaultThumbnail;	
		}, function(newV, oldV) {
			if (newV === false) {
				return true;
			}
			if (newV !== oldV) {
				$scope.updateDefaultThumbnail();	
			}
		}
	);
	$scope.updateDefaultThumbnail = function() {
		$http({
		  method: 'POST',
		  url: $rootScope.serverName + '/api/youtube.js',
		  data: {opt:'updateDefaultThumbnail', vid:$scope._adminItem.vid, defaultThumbnail:$scope._adminItem.defaultThumbnail}	
		}).then(function successCallback(response) {
			$scope.$parent.loadList();
			$scope._adminItem.updated = response.data.updated;
		  }, function errorCallback(response) {
			console.log(response);
			});					
	};	
	
	$scope.setupThumbnail = function(id) {
		$scope._adminItem.defaultThumbnail = id;
	};		
	
	$scope.styleDefaultThumbnail = function(id) {
		if ($scope._adminItem.defaultThumbnail === id) return {border:'3px solid red'};
		else  return {border:'3px solid transparent'};
	};
	
	/* --- Admin form ----- */
	
	$scope.initAdminFrom = function() {
		if (!$scope._adminFormData) {
			$scope._adminFormData = {
				title:($scope._adminItem)?$scope._adminItem.title:'',
				description:($scope._adminItem)?$scope._adminItem.description:''
			};
		}		
	};
	
	
	$scope.styleAdminFormSubmitable = function() {
		$scope.initAdminFrom();
		
		if (!$scope._adminFormData.title) {
			$scope._adminFormDataErr = "Title can not been empty";
			return { display:'none'};
		} else {
			delete $scope._adminFormDataErr;
		}
		
		if (
			$scope._adminItem.title != $scope._adminFormData.title ||
		   	$scope._adminItem.description != $scope._adminFormData.description
		) {
			return { };
		} else {
			return { display:'none'};
		}	
	};

	$scope.updateAdminForm = function() {
		var v = $scope._adminFormData;
		$http({
		  method: 'POST',
		  url: $rootScope.serverName + '/api/youtube.js',
		  data: {opt:'updateVideoRec', vid:$scope._adminItem.vid, data: $scope._adminFormData}	
		}).then(function successCallback(response) {
			$scope._adminItem.title = $scope._adminFormData.title; 
			$scope._adminItem.description = $scope._adminFormData.description;
			$scope._adminItem.updated = response.data.updated;
			$scope.$parent.loadList();
			
		  }, function errorCallback(response) {
			console.log(response);
			});
	};
	
});