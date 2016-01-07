var app = angular.module('app', []);

function toggleFit(e) {
	if ($(e).hasClass('fluid')) {
		$(e).removeClass('fluid');
	} else {
		$(e).addClass('fluid');
	}
}

app.controller('appCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.title = "nbb";
	$scope.page = 1;
	$scope.tags = "";
	$scope.data = [];
	$scope.loading = false;
	$scope.index = -1;

	$scope.IMAGE_TYPES = ["jpg", "png", "gif"];
	$scope.VIDEO_TYPES = ["webm", "mp4"];

	$scope.apis = {
		"danbooru": {
			"name": "Danbooru",
			"base_url": "https://danbooru.donmai.us",
			"api": "https://danbooru.donmai.us/posts.json",
			"api_type": "json"
		},
		"danbooru (sfw)": {
			"name": "Safebooru (sfw)",
			"base_url": "https://safebooru.donmai.us",
			"api": "https://safebooru.donmai.us/posts.json",
			"api_type": "json"
		},
		"yande.re": {
			"name": "yande.re",
			"base_url": "https://yande.re",
			"api": "https://yande.re/post.json",
			"api_type": "json"
		}
	}

	$('#tag-input').focus();

	$scope.newQuery = function(api) {
		$scope.page = 1;
		$scope.queryAPI(api);
	}

	$scope.queryAPI = function(api) {
		$scope.tags = $scope.tags.toLowerCase();
		$scope.api = api;
		$scope.index = -1;
		$scope.loading = true;
		var api_data = $scope.apis[api];
		var options = {
			limit: '100',
			page: $scope.page,
			tags: $scope.tags
		};
		$scope.title = "nbb - " + $scope.tags;
		var url = api_data.api;
		$scope.base_url = api_data.base_url;
		$http.get(url, {params: options}).
			success(function(data) {
				$scope.data = data;
				$scope.data = $scope.data.filter(function(v) {
					return v.file_url;
				});
				$scope.loading = false;
				setTimeout(function() {
					$("#preview_list").scrollTo(0, 100);
				}, 100);
			}).error(function() {
				console.log("error");
				$scope.loading = false;
			});
	}

	$scope.copyURL = function() {
		window.prompt("Copy to clipboard: Ctrl+C, Enter", $scope.src);
	}

	$scope.setActive = function(index) {
		$scope.index = index;
		$(".preview").eq(index).removeClass("selected");
		$scope.active = $scope.data[index];
		console.log($scope.active);
		$(".preview").eq(index).addClass("selected");
		$("#image").remove();
		$("#video").remove();
		var e = ".preview:eq(" + index + ")";
		setTimeout(function() {
			$("#preview_list").scrollTo(e, 100);
		}, 100);
		var file_url = $scope.active.file_url;
		var src = file_url.indexOf("http://") == 0 || file_url.indexOf("https://") == 0 ?
				file_url : $scope.base_url + file_url;
		$scope.src = src;
		console.log(src);
		var ext = src.split('.').slice(-1)[0];
		console.log(ext);
		if ($scope.IMAGE_TYPES.indexOf(ext) >= 0) {
			var img = $('<img id="image" class="fluid" onclick="toggleFit(this)">');
			console.log(src);
			img.attr('src', src);
			img.appendTo("#parent");
		} else if ($scope.VIDEO_TYPES.indexOf(ext) >= 0) {
			var video = $('<video>', {
				id: 'video',
				class: 'fluid',
				controls: true,
				loop: true,
				src: src
			});
			video.appendTo("#parent");
		}
		$scope.$apply();
	}


	$scope.incPage = function(v) {
		if ($scope.page == 1 && !v) {
			return;
		}
		if (v) {
			$scope.page = $scope.page + 1;
		} else {
			$scope.page = $scope.page = 1;
		}
		$scope.queryAPI($scope.api);
	}

	var height = $('#search').outerHeight(true) + $('#pagination').outerHeight(true);
	$('#preview_list').css({ 'max-height': 'calc(100% - ' + height + 'px - 10px)' });
	var height = $('#booru-button').outerHeight(true) + $('#buttons').outerHeight(true);
	$('#tag_list').css({ 'max-height': 'calc(100% - ' + height + 'px - 10px)' });

	$(document).keydown(function(e) {
		switch(e.which) {
			case 38:
				if ($scope.index > 0) {
					$scope.index = $scope.index - 1;
					$scope.setActive($scope.index);
				}
				break;
			case 40:
				if ($scope.index < $scope.data.length - 1 &&
						$scope.data.length > 0) {
					$scope.index = $scope.index + 1;
					$scope.setActive($scope.index);
				}
				break;
		}
	});
}]);
