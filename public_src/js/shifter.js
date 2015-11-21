(function () {
	$(function () {
		$('#calculate-delta').click(calculateDelta());
	});

	function calculateDelta() {
		var movieTimestamp =
				(
						parseInt($('#movie-timestamp-hour').val() || 0, 10) * 3600 +
						parseInt($('#movie-timestamp-minute').val() || 0, 10) * 60 +
						parseInt($('#movie-timestamp-second').val() || 0, 10)
				) * 1000 +
				parseInt($('#movie-timestamp-millisecond').val() || 0, 10);
		var subtitlesTimestamp =
				(
						parseInt($('#subtitles-timestamp-hour').val() || 0, 10) * 3600 +
						parseInt($('#subtitles-timestamp-minute').val() || 0, 10) * 60 +
						parseInt($('#subtitles-timestamp-second').val() || 0, 10)
				) * 1000 +
				parseInt($('#subtitles-timestamp-millisecond').val() || 0, 10);
		var delta = movieTimestamp - subtitlesTimestamp;
		var towardsStart = delta < 0;
		var deltaHour, deltaMinute, deltaSecond;
		delta = Math.abs(delta);
		deltaHour = Math.floor(delta / 3600000);
		delta -= deltaHour * 3600000;
		deltaMinute = Math.floor(delta / 60000);
		delta -= deltaMinute * 60000;
		deltaSecond = Math.floor(delta / 1000);
		delta -= deltaSecond * 1000;
		$('#delta-hour').val(deltaHour);
		$('#delta-minute').val(deltaMinute);
		$('#delta-second').val(deltaSecond);
		$('#delta-millisecond').val(delta);
		$('#towards-start')[ 0 ].checked = towardsStart;
	}
})();
