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
	$scope.current_api = "danbooru (sfw)";
	$scope.maximized = false;
	$scope.preloadCount = 3;

	new Clipboard('.clipboard');
	
	toastr.options = {
		"positionClass": "toast-bottom-right"
	}

	$scope.IMAGE_TYPES = ["jpg", "png", "gif"];
	$scope.VIDEO_TYPES = ["webm", "mp4"];

	$scope.apis = {
		"safebooru": {
			"name": "Safebooru",
			"base_url": "http://safebooru.org",
			"page_url": "http://safebooru.org/index.php?page=post&s=view&id=",
			"api": "http://safebooru.org/index.php",
			"api_type": "xml"
		},
		"gelbooru": {
			"name": "Gelbooru",
			"base_url": "http://gelbooru.com",
			"page_url": "http://gelbooru.com/index.php?page=post&s=view&id=",
			"api": "http://gelbooru.com/index.php",
			"api_type": "xml",
			"favicon": "http://gelbooru.com/favicon.png"
		},
		"danbooru": {
			"name": "Danbooru",
			"base_url": "https://danbooru.donmai.us",
			"page_url": "https://danbooru.donmai.us/posts/",
			"api": "https://danbooru.donmai.us/posts.json",
			"api_type": "json"
		},
		"danbooru (sfw)": {
			"name": "Danbooru (sfw)",
			"base_url": "https://safebooru.donmai.us",
			"page_url": "https://safebooru.donmai.us/posts/",
			"api": "https://safebooru.donmai.us/posts.json",
			"api_type": "json"
		},
		"yande.re": {
			"name": "yande.re",
			"base_url": "https://yande.re",
			"page_url": "https://yande.re/post/show/",
			"api": "https://yande.re/post.json",
			"api_type": "json"
		}
	}

	$('#tag-input').focus();

	$scope.setAPI = function(api) {
		$scope.current_api = api;
	}

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
		var url = api_data.api;
		$scope.base_url = api_data.base_url;
		$scope.title = $scope.apis[$scope.api].name + " - " + $scope.tags + " - " + "Page " + $scope.page;
		if (api_data.api_type == "json") {
			var options = {
				limit: '100',
				page: $scope.page,
				tags: $scope.tags
			};
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
		} else if (api_data.api_type == "xml") {
			var options = {
				page: 'dapi',
				s: 'post',
				q: 'index',
				limit: '100',
				pid: $scope.page - 1,
				tags: $scope.tags
			};
			$http.get(url, {params: options}).
				success(function(data) {
					var x2js = new X2JS();
					var posts = x2js.xml_str2json(data)['posts']['post'];
					$scope.data = [];
					for (var i = 0; i < posts.length; i++) {
						var e = {};
						e.preview_url = posts[i]._preview_url;
						e.file_url = posts[i]._file_url;
						e.tag_string = posts[i]._tags;
						e.id = posts[i]._id;
						$scope.data.push(e);
					}
					$scope.loading = false;
					setTimeout(function() {
						$("#preview_list").scrollTo(0, 100);
					}, 100);
				}).error(function() {
					console.log("error");
					$scope.loading = false;
				});
		}
	}

	$scope.copyURL = function() {
		window.prompt("Copy to clipboard: Ctrl+C, Enter", $scope.src);
	}

	$scope.toggleFullscreen = function() {
		$scope.maximized = !$scope.maximized;
		if ($scope.maximized) {
			$('#parent').removeClass('col-xs-6');
			$('#parent').removeClass('col-lg-8');
			$('#parent').addClass('col-xs-12');
		} else {
			$('#parent').addClass('col-xs-6');
			$('#parent').addClass('col-lg-8');
		}
	}

	$scope.setActive = function(index) {
		$scope.index = index;
		$(".selected").removeClass("selected");
		$scope.active = $scope.data[index];
		$(".preview").eq(index).parent().addClass("selected");
		$("#image").remove();
		$("#video").remove();
		var e = ".preview:eq(" + index + ")";
		setTimeout(function() {
			$("#preview_list").scrollTo(e, 100, {
				offset: 0 - $(window).width() / 3
			});
		}, 100);
		var file_url = $scope.active.file_url;
		var src = file_url.indexOf("http://") == 0 || file_url.indexOf("https://") == 0 ?
				file_url : $scope.base_url + file_url;
		$scope.src = src;
		var ext = src.split('.').slice(-1)[0];
		if ($scope.IMAGE_TYPES.indexOf(ext) >= 0) {
			var img = $('<img id="image" class="fluid" onclick="toggleFit(this)">');
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
		$scope.preload();
	}

	$scope.preload = function() {
		var images = new Array();
		for (var i = 0; i < $scope.preloadCount; i++) {
			var file_url = $scope.data[$scope.index + i].file_url;
			var src = file_url.indexOf("http://") == 0 || file_url.indexOf("https://") == 0 ?
				file_url : $scope.base_url + file_url;
			images[i] = new Image();
			images[i].src = src;
		}
	}

	$scope.addRemoveTag = function(tag) {
		var tag = tag.toLowerCase();
		var split = $scope.tags.split(' ');
		var index = split.indexOf(tag);
		if (index > -1) {
			split.splice(index, 1);
		} else {
			split.push(tag);
		}
		$scope.tags = split.join(" ");
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
		$scope.$apply(function() {
			switch(e.which) {
				// up
				case 38:
					$scope.incPage(1);
					break;
				// down
				case 40:
					$scope.incPage(0);		
					break;
				// enter
				case 13:
					$scope.newQuery($scope.current_api);
					break;
				// left
				case 37:
					if ($scope.index > 0) {
						$scope.index = $scope.index - 1;
						$scope.setActive($scope.index);
					}
					break;
				// right
				case 39:
					if ($scope.index < $scope.data.length - 1 &&
						$scope.data.length > 0) {
						$scope.index = $scope.index + 1;
						$scope.setActive($scope.index);
					}
					break;
				// esc
				case 27:
					//$scope.toggleFullscreen();
					break;
			}
		});
	});
}]);
