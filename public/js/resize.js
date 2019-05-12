/*****脚本*****/
//不支持safari

/*宽度100%缩放 - 整屏*/ //缩放的DIV上CSS要加上transform-origin:top left;
function widthFull(shell) {
	console.log('i')
	var arr = shell.constructor === Array ? shell : [shell];
	document.getElementById("main").css({
		overflow: "hidden"
	});
	window.resize(function() {
		var i = 0,
			$width = $(window).width(),
			$height = $(window).height();
		for (; i < arr.length; i++) {
			var wRate = $width / ($(arr[i]).width());
			var hRate = $height / ($(arr[i]).height());
			$(arr[i]).css({
				transform: "scale(" + wRate + "," + hRate + ")"
			});
		}
	}).trigger('resize');

}
