var app = angular.module('app', []);
const {ipcRenderer} = require('electron');

angular.module('app')
.directive('menuClose', function() {
	return {
		restrict: 'AC',
		link: function($scope, $element) {
			$element.bind('click', function() {
				var drawer = angular.element(document.querySelector('.mdl-layout__drawer'));
				if(drawer) {
					drawer.toggleClass('is-visible');
					var obfuscator = angular.element(document.querySelector('.mdl-layout__obfuscator'));
					obfuscator.toggleClass('is-visible');
				}
			});
		}
	};
});

function toggleFit(e) {
	if ($(e).hasClass('fitImage')) {
		$(e).removeClass('fitImage');
	} else {
		$(e).addClass('fitImage');
	}
}

app.filter('trusted', ['$sce', function ($sce) {
	return function(url) {
		return $sce.trustAsResourceUrl(url);
	};
}]);


app.directive('imageonload', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('load', function() {
				scope.$apply(attrs.imageonload);
			});
		}
	};
});

var tabs = [];

var test;

app.controller('appCtrl', ['$scope', '$http', function($scope, $http) {
	var vm = this;
	new Clipboard('.clipboard');
	toastr.options = {
		"positionClass": "toast-bottom-right"
	}
	$('#tag-input').focus();
	vm.fitImage = true;

	vm.toggleFit = function() {
		vm.fitImage = !vm.fitImage;
	}

	vm.appVersion = "";
	ipcRenderer.on('appVersion', function(event, arg) {
		$scope.$apply(function() {
			vm.appVersion = arg;
			console.log(arg);
		});
	});

	ipcRenderer.on('updateStatus', function(event, arg) {
		$scope.$apply(function() {
			vm.updateStatus = arg;
			console.log(arg);
		});
	});

	ipcRenderer.send('ping');

	vm.i = 0;
	vm.preloadCount = 3;
	vm.viewTags = false;

	vm.tabs = [];
	vm.new_tab = function() {
		d = {
			title: "",
			page: "1",
			tags: "",
			data: [],
			loading: false,
			index: -1,
			current_api: "danbooru (sfw)",
			maximized: false
		}
		return d;
	}
	vm.tabs[0] = vm.new_tab();
	console.log(vm.tabs[0]);

	vm.IMAGE_TYPES = ["jpg", "png", "gif", "jpeg"];
	vm.VIDEO_TYPES = ["webm", "mp4"];

	vm.apis = {
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
		},
		"e621": {
			"name": "e621",
			"base_url": "https://e621.net",
			"page_url": "https://e621.net/post/show/",
			"api": "https://e621.net/post/index.xml",
			"api_type": "xml"
		}
	}


	vm.setAPI = function(api) {
		vm.tabs[vm.i].current_api = api;
	}

	function newQuery(api) {
		if (api === undefined) {
			console.log("[DEBUG]: api for newQuery is undefined.");
			return;
		}
		console.log(api);
		vm.tabs[vm.i].page = 1;
		vm.queryAPI(api);
	}

	vm.newQuery = newQuery;

	vm.queryAPI = function(api) {
		let index = vm.i;
		console.log(index);
		console.log(api);
		vm.tabs[index].tags = vm.tabs[index].tags.toLowerCase();
		vm.tabs[index].api = api;
		vm.tabs[index].index = -1;
		vm.tabs[index].loading = true;
		var api_data = vm.apis[api];
		console.log(api_data);
		var url = api_data.api;
		console.log(url);
		vm.tabs[index].base_url = api_data.base_url;
		console.log(api_data.base_url);
		vm.tabs[index].title = "- " + vm.apis[vm.tabs[index].api].name + " - " + vm.tabs[index].tags + " - " + "Page " + vm.tabs[index].page;
		console.log('a');
		if (api_data.api_type == "json") {
			var options = {
				limit: '100',
				page: vm.tabs[index].page,
				tags: vm.tabs[index].tags
			};
			$http.get(url, {params: options}).
				success(function(data) {
					console.log(data);
					vm.tabs[index].data = data;
					vm.tabs[index].data = vm.tabs[index].data.filter(function(v) {
						return v.file_url;
					});
					vm.tabs[index].loading = false;
					setTimeout(function() {
						$(".verticalPreviews").scrollTo(0, 100);
					}, 100);
				}).error(function() {
					console.log("error");
					vm.tabs[index].loading = false;
				});
		} else if (api_data.api_type == "xml") {
			var options = {
				page: 'dapi',
				s: 'post',
				q: 'index',
				limit: '100',
				pid: vm.tabs[index].page - 1,
				tags: vm.tabs[index].tags
			};
			$http.get(url, {params: options}).
				success(function(data) {
					var x2js = new X2JS();
					var posts = x2js.xml_str2json(data)['posts']['post'];
					console.log(data);
					console.log(posts);
					vm.tabs[index].data = [];
					for (var i = 0; i < posts.length; i++) {
						var e = {};
						if (posts[i]._id) {
							e.preview_url = posts[i]._preview_url;
							e.file_url = posts[i]._file_url;
							e.tag_string = posts[i]._tags;
							e.id = posts[i]._id;
						} else {
							e.preview_url = posts[i].preview_url;
							e.file_url = posts[i].file_url;
							e.tag_string = posts[i].tags;
							e.id = posts[i].id;
						}
						vm.tabs[index].data.push(e);
					}
					vm.tabs[index].loading = false;
					setTimeout(function() {
						$(".verticalPreviews").scrollTo(0, 100);
					}, 100);
				}).error(function() {
					console.log("error");
					vm.tabs[index].loading = false;
				});
		}
	}

	vm.copyURL = function() {
		window.prompt("Copy to clipboard: Ctrl+C, Enter", vm.tabs[vm.i].src);
	}

	vm.toggleFullscreen = function() {
		vm.tabs[vm.i].maximized = !vm.tabs[vm.i].maximized;
		if (vm.tabs[vm.i].maximized) {
			$('#parent').removeClass('col-xs-6');
			$('#parent').removeClass('col-lg-8');
			$('#parent').addClass('col-xs-12');
		} else {
			$('#parent').addClass('col-xs-6');
			$('#parent').addClass('col-lg-8');
		}
	}

	vm.setActive = function(index) {
		let tabIndex = vm.i;
		if (vm.tabs[tabIndex].data[index] === undefined) {
			console.log("[DEBUG] Data is undefined. Ignoring.");
			return;
		}
		vm.tabs[tabIndex].index = index;
		console.log("[DEBUG] index: " + vm.tabs[tabIndex].index);
		$(".selected").removeClass("selected");
		vm.tabs[tabIndex].active = vm.tabs[tabIndex].data[index];
		console.log("[DEBUG] active:");
		console.log(vm.tabs[tabIndex].active);
		$(".preview").eq(index).parent().addClass("selected");
		vm.removeActive();
		var e = ".preview:eq(" + index + ")";
		setTimeout(function() {
			$(".verticalPreviews").scrollTo(e, 100, {
				offset: 0 - $(window).width() / 3
			});
		}, 100);
		var file_url = vm.tabs[tabIndex].active.file_url;
		var src = file_url.indexOf("http://") == 0 || file_url.indexOf("https://") == 0 ?
			file_url : vm.tabs[tabIndex].base_url + file_url;
		vm.tabs[tabIndex].src = src;
		console.log("[DEBUG] src: " + vm.tabs[tabIndex].src);
		var ext = src.split('.').slice(-1)[0];
		console.log(src);
		if (vm.IMAGE_TYPES.indexOf(ext) >= 0) {
			vm.tabs[tabIndex].img_src = src;
		} else if (vm.VIDEO_TYPES.indexOf(ext) >= 0) {
			vm.tabs[tabIndex].video_src = src;
		} else if (ext == "swf") {
			vm.tabs[tabIndex].swf_src = src;
		}
		vm.preload();
		if (ext == "swf") {
			return function() {
				var swf = document.getElementById('swf');
				console.log(swf);
			}
		}
	}

	vm.preload = function() {
		let index = vm.i;
		var images = new Array();
		for (var i = 0; i < vm.preloadCount; i++) {
			var file_url = vm.tabs[index].data[vm.tabs[index].index + i].file_url;
			var src = file_url.indexOf("http://") == 0 || file_url.indexOf("https://") == 0 ?
				file_url : vm.tabs[index].base_url + file_url;
			images[i] = new Image();
			images[i].src = src;
		}
	}

	vm.addRemoveTag = function(tag) {
		var tag = tag.toLowerCase();
		var split = vm.tabs[vm.i].tags.split(' ');
		var index = split.indexOf(tag);
		if (index > -1) {
			split.splice(index, 1);
		} else {
			split.push(tag);
		}
		vm.tabs[vm.i].tags = split.join(" ");
	}

	vm.incPage = function(v) {
		if (vm.tabs[vm.i].page == 1 && !v) {
			return;
		}
		if (v) {
			vm.tabs[vm.i].page = vm.tabs[vm.i].page + 1;
		} else {
			vm.tabs[vm.i].page = vm.tabs[vm.i].page - 1;
		}
		vm.queryAPI(vm.tabs[vm.i].api);
	}

	vm.closeTab = function(i) {
		if (vm.tabs.length == 1) {
			console.log("[DEBUG]: Trying to close last tab. Ignoring.");
			return;
		}
		if (vm.i == i && i == vm.tabs.length - 1) {
			vm.switchTab(i - 1);
		}
		vm.tabs.splice(i, 1);
		if (vm.i == i) {
			vm.switchTab(vm.i);
		}
		if (i < vm.i) {
			vm.switchTab(vm.i - 1);
		}
	}

	vm.removeActive = function() {
		vm.tabs[vm.i].img_src = false;
		vm.tabs[vm.i].video_src = false;
		vm.tabs[vm.i].swf_src = false;
		vm.tabs[vm.i].loaded = false;
	}

	vm.switchTab = function(i) {
		vm.i = i;
		vm.removeActive();
		vm.setActive(vm.tabs[vm.i].index);
		$('#tag-input').focus();
	}

	vm.newTab = function() {
		vm.tabs.push(vm.new_tab());
	}

	vm.onLoad = function() {
		console.log("Loaded!");
		vm.tabs[vm.i].loaded = true;
	}

	vm.onUnload = function() {
		console.log("Unloaded!");
	}

	var height = $('#search').outerHeight(true) + $('#pagination').outerHeight(true);
	$('#preview_list').css({ 'max-height': 'calc(100% - ' + height + 'px - 10px)' });
	var height = $('#booru-button').outerHeight(true) + $('#buttons').outerHeight(true);
	$('#tag_list').css({ 'max-height': 'calc(100% - ' + height + 'px - 10px)' });

	$(document).keydown(function(e) {
		$scope.$apply(function() {
			console.log(e.which);
			switch(e.which) {
				// up
				case 38:
					vm.incPage(1);
					break;
					// down
				case 40:
					vm.incPage(0);		
					break;
					// enter
				case 13:
					vm.newQuery(vm.tabs[vm.i].current_api);
					break;
					// left
				case 37:
					if (vm.tabs[vm.i].index > 0) {
						vm.tabs[vm.i].index = vm.tabs[vm.i].index - 1;
						vm.setActive(vm.tabs[vm.i].index);
					}
					break;
					// right
				case 39:
					if (vm.tabs[vm.i].index < vm.tabs[vm.i].data.length - 1 &&
							vm.tabs[vm.i].data.length > 0) {
						vm.tabs[vm.i].index = vm.tabs[vm.i].index + 1;
						vm.setActive(vm.tabs[vm.i].index);
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
