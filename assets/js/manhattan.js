var dumpStats;

var mobileSafari;

(function () {
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	mobileSafari = iOS && webkit && !ua.match(/CriOS/i);
})();

(function ($) {
	var scrollProgress = 0,
		targetScrollProgress = 0,
		currentFrame = -5,
		totalFrames = 0,
		imagesLoadProgress = 0;
	var canvas = $("#cnv").get(0);
	var ctx = canvas.getContext("2d");
	var sizeItUp;
	var swiper;
	var initialSwipeHint = false;

	if (mobileSafari) {
		$("html").addClass("mobile-safari");
	}

	sizeItUp = function () {
		var frame = $(".frame-scrobbler");
		var scale = 1.3;
		var frameAspectRatio = 2320 / 1480;

		if ($("html").hasClass("mobile-safari")) {
			var targetHeight = ($(window).innerWidth() / frameAspectRatio) * scale;
			frame.css({
				/*
				height: window.innerHeight * scale + "px",
				width: window.innerHeight * frameAspectRatio * scale + "px",
				*/
				height: targetHeight - 50 + "px",
				width: (targetHeight - 50) * frameAspectRatio + "px",
			});
		} else if (
			$(window).innerWidth() / $(window).innerHeight() >
			frameAspectRatio
		) {
			frame.css({
				/*
				height: window.innerHeight * scale + "px",
				width: window.innerHeight * frameAspectRatio * scale + "px",
				*/
				height: ($(window).innerWidth() / frameAspectRatio) * scale + "px",
				width: $(window).innerWidth() * scale + "px",
			});
		} else {
			frame.css({
				height: ($(window).innerWidth() / frameAspectRatio) * scale + "px",
				width: $(window).innerWidth() * scale + "px",
			});
		}

		$(".page-container").css({
			width: frame.width() + "px",
			height: frame.height() + "px",
		});

		canvas.width = $(".frame-scrobbler").width() * 1.5;
		canvas.height = $(".frame-scrobbler").height() * 1.5;

		currentFrame = -1;
	};

	$(window).on("resize", sizeItUp);

	sizeItUp();

	function renderFrame() {
		window.requestAnimationFrame(renderFrame);
		if (imagesLoadProgress < 1) {
			return;
		}

		var p1 = Math.abs(swiper.translate) / $(swiper.el).width();
		targetScrollProgress = p1;

		scrollProgress +=
			Math.round(((targetScrollProgress - scrollProgress) / 15) * 1000) / 1000;

		var index_p1 = Math.floor(p1);
		var fraction_p1 = scrollProgress - index_p1;

		var frame_p1 = parseInt(
			$("[data-frame-number]:eq(" + index_p1 + ")").attr("data-frame-number")
		);
		var frame_p2 = parseInt(
			$("[data-frame-number]:eq(" + (index_p1 + 1) + ")").attr(
				"data-frame-number"
			)
		);
		if (isNaN(frame_p2)) {
			frame_p2 = totalFrames - 8 + 20;
		}

		var targetFrame = frame_p1 + (frame_p2 - frame_p1) * fraction_p1;

		var n = Math.round(targetFrame);
		n = Math.min(totalFrames - 8, Math.max(0, n));

		// console.log(p1, frame_p1, frame_p2, fraction_p1, n);

		var img = preloader.images[n];
		var w = canvas.width;
		var h = canvas.height;

		if (img && n !== currentFrame) {
			ctx.drawImage(img, 0, 0, w, h);
			currentFrame = n;
			// console.log(currentFrame);

			if ([32, 52, 72, 92, 112, 132, 152].indexOf(n) > -1) {
				// console.log(".frame-scrobbler img[data-frame=" + n + "]");
				$(".frame-scrobbler img[data-frame=" + n + "]").addClass("show");
			} else {
				$(".frame-scrobbler img[data-frame]").removeClass("show");
			}
		}
	}

	var imgArr = [];

	//TODO: frames number 185
	for (var i = 10001; i < 10033; i++) {
		imgArr.push("assets/img/new/frames/frame/" + i + ".jpg");
	}

	imgArr = imgArr.concat(
		["10032", "10052", "10072", "10092", "10112", "10132", "10152"].map(
			function (f) {
				return "assets/img/old/frames-hires/" + f + ".jpg";
			}
		)
	);

	var preloader = preloadImages(imgArr);

	preloader.onProgress = function (progress) {
		imagesLoadProgress = progress;
		var circle = $("circle.progress");
		circle.css({
			"stroke-dashoffset": (1 - progress) * 396,
		});
	};

	preloader.onComplete = function () {
		$(".loading").addClass("hiding");
		renderFrame();
		currentFrame = -1;

		window.setTimeout(function () {
			$(".loading").addClass("hide");
		}, 1000);

		if (swiper.activeIndex < 2) {
			showHint("begin");
		}
	};

	preloader.load();

	//TODO: Speed for page turn
	swiper = new Swiper(".page-container", {
		direction: "horizontal",
		slidesPerView: 1,
		spaceBetween: 0,
		mousewheel: true,
		speed: 300,
		hashNavigation: false,
		threshold: 30,
	});

	swiper.on("slideChangeTransitionEnd", function () {
		switch (swiper.activeIndex) {
			default:
				break;
		}
	});

	swiper.on("slideChangeTransitionStart", function () {
		if (!initialSwipeHint) {
			initialSwipeHint = true;
			hideHint("begin");
		}

		if ([2, 3, 4, 5, 6, 7].indexOf(swiper.activeIndex) > -1) {
			showHint("more-info");
		} else {
			hideHint("more-info");
		}
	});

	function preloadImages(images) {
		var loader = {
			onProgress: function (progress) {
				imagesLoadProgress = progress;
				// console.log(progress);
			},
			onComplete: function () {
				// console.log(loader);
			},
			images: images,
			loadedCount: 0,
			load: function () {
				var that = this;
				totalFrames = this.images.length - 1;

				this.images = this.images.map(function (img) {
					var i = new Image();
					i.src = img;
					i.onload = function () {
						that.loadedCount++;
						that.onProgress(that.loadedCount / that.images.length);
						if (that.loadedCount / that.images.length == 1) {
							that.onComplete();
						}
					};
					return i;
				});
			},
		};

		return loader;
	}

	$(".prev-next-btn").on("tap", "a", function (e) {
		e.preventDefault();
		var that = $(this).parent("div");
		if (that.hasClass("prev-slide-btn")) {
			swiper.slidePrev();
		} else {
			swiper.slideNext();
		}
	});

	$(".prev-next-btn").on("click", "a", function (e) {
		e.preventDefault();
		var that = $(this).parent("div");
		if (that.hasClass("prev-slide-btn")) {
			swiper.slidePrev();
		} else {
			swiper.slideNext();
		}
	});

	$("[data-action=close-popover]").on("click", function (e) {
		e.preventDefault();
		$("div.popover-slide").removeClass("show");
		$(".popover").removeClass("show");
	});

	$(".tile[data-target]").on("click", function (e) {
		e.preventDefault();
		var target = $(this).attr("data-target");
		if (["spirits-menu", "food-dessert"].indexOf(target) > -1) {
			if (target == "spirits-menu") {
				window.open(
					"https://regentsingapore.com.sg/wp-content/uploads/2021/06/Manhattan_Food_Spirits_Wine.pdf",
					"_blank"
				);
			}
			if (target == "food-dessert") {
				window.open(
					"https://regentsingapore.com.sg/wp-content/uploads/2021/06/Manhattan_Food_Spirits_Wine.pdf",
					"_blank"
				);
			}
		} else {
			showPopover(target);
		}
	});

	$("[data-action=prev-slide-in-set], [data-action=next-slide-in-set]").on(
		"click",
		function (e) {
			e.preventDefault();
			var curSlide = $(".popover-slide.show");
			var action = {
				direction: $(this).data("action"),
				content: curSlide.data("content"),
				set: curSlide.data("set"),
				order: curSlide.data("order"),
			};

			var set = $("[data-set=" + action.set + "]")
				.toArray()
				.sort(function (a, b) {
					return $(a).attr("data-order") - $(b).attr("data-order");
				});
			var curIndex = set.findIndex(function (c) {
				return $(c).attr("data-content") === action.content;
			});
			var targetIndex;

			if (action.direction === "prev-slide-in-set") {
				if (curIndex === 0) {
					targetIndex = set.length - 1;
				} else {
					targetIndex = curIndex - 1;
				}
			} else if (action.direction === "next-slide-in-set") {
				if (curIndex === set.length - 1) {
					targetIndex = 0;
				} else {
					targetIndex = curIndex + 1;
				}
			}

			var target = $(set[targetIndex]);

			selectSlide(target.attr("data-content"));
		}
	);

	function showPopover(target) {
		selectSlide(target);
		var slideNum = $("[data-content=" + target + "]").attr("data-set");
		if ($("[data-set=" + slideNum + "]").length < 2) {
			togglePrevNextMenu(false);
		} else {
			togglePrevNextMenu(true);
		}
		$(".popover").addClass("show");
	}

	function togglePrevNextMenu(toggle) {
		if (toggle) {
			$(
				"[data-action=prev-slide-in-set], [data-action=next-slide-in-set]"
			).removeClass("hide");
			$(".text-wrapper .text").removeClass("single-menu");
		} else {
			$(
				"[data-action=prev-slide-in-set], [data-action=next-slide-in-set]"
			).addClass("hide");
			$(".text-wrapper .text").addClass("single-menu");
		}
	}

	function selectSlide(target) {
		$("div.popover-slide").removeClass("show");
		$("div.popover-slide[data-content=" + target + "]").addClass("show");
	}

	function showHint(hint, time) {
		$("[data-hint=" + hint + "]").addClass("show");

		if (time > 0) {
			window.setTimeout(function () {
				hideHint(hint);
			}, time);
		}
	}

	function hideHint(hint) {
		$("[data-hint=" + hint + "]").removeClass("show");
	}

	dumpStats = function () {
		console.log({
			scrollProgress: scrollProgress,
			currentFrame: currentFrame,
			totalFrames: totalFrames,
			imagesLoadProgress: imagesLoadProgress,
		});
	};

})(jQuery);