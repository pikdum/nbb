var app = angular.module('app', []);

app.filter("trustUrl", ['$sce', function ($sce) {
	return function (recordingUrl) {
		return $sce.trustAsResourceUrl(recordingUrl);
	};
}]);

app.controller('appCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.title = "nbb";
	$scope.page = 1;
	$scope.tags = "touhou small_breasts";
	$scope.data = [];
	$scope.loading = false;
	$scope.index = -1;

	$scope.IMAGE_TYPES = ["jpg", "png", "gif"];
	$scope.VIDEO_TYPES = ["webm", "mp4"];

	$scope.apis = {
		"danbooru": {
			"name": "Danbooru",
			"base_url": "https://danbooru.donmai.us",
			"api": "http://danbooru.donmai.us/posts.json",
			"api_type": "json"
		}
	}

	$scope.queryAPI = function(api) {
		$scope.index = -1;
		$scope.loading = true;
		var api_data = $scope.apis[api];
		var options = "?limit=100&page=" + $scope.page + "&tags=" + $scope.tags;
		var url = api_data.api + options;
		$scope.base_url = api_data.base_url;
		$http.get(url).
			success(function(data) {
				$scope.data = data;
				$scope.loading = false;
			}).error(function() {
				console.log("error");
				$scope.loading = false;
			});
	}

	$scope.setActive = function(index) {
		$scope.index = index;
		$(".preview").eq(index).removeClass("selected");
		$scope.active = $scope.data[index];
		$(".preview").eq(index).addClass("selected");
		console.log($scope.active.file_url);
		$("#image").remove();
		$("#video").remove();
		var e = ".preview:eq(" + index + ")";
		$("#preview_list").scrollTo(e);
		if ($scope.IMAGE_TYPES.indexOf($scope.active.file_ext) >= 0) {
			var img = $('<img id="image" class="fluid">');
			img.attr('src', $scope.base_url + $scope.active.file_url);
			img.appendTo("#parent");
			console.log("appended");
		} else if ($scope.VIDEO_TYPES.indexOf($scope.active.file_ext) >= 0) {
			var video = $('<video>', {
				id: 'video',
				class: 'fluid',
				controls: true,
				src: $scope.base_url + $scope.active.file_url
			});
			video.appendTo("#parent");
		}
	}

	$(document).keydown(function(e) {
		console.log("index: " + $scope.index);
		switch(e.which) {
			case 38:
				if ($scope.index > 0) {
					$scope.index = $scope.index - 1;
					$scope.setActive($scope.index);
				}
				break;
			case 40:
				if (!$scope.index) {
					$scope.index = 0;
					$scope.setActive($scope.index);
				}
				if ($scope.index < 100) {
					$scope.index = $scope.index + 1;
					$scope.setActive($scope.index);
				}
				break;
		}
	});
	var url = "http://danbooru.donmai.us/posts.json?limit=100";
	var additions = "&page=" + $scope.page + "&tags=" + $scope.tags;
}]);
