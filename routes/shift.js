;
(function () {
	var fs = require('fs');
	var sp = require('sprintf');
	exports.processRequest = function (request, response) {
		var params = request.body;
		var fileMeta = request.files;
		if (!fileMeta || !fileMeta.input.path || !fileMeta.input.size) {
			error('No file specified.')
		}
		var shift = determineShift(params);
		var timeRE = (function () {
			var timestamp = '(\\d+):(\\d+):(\\d+),(\\d+)';
			var between = '\\s+-->\\s+';
			return new RegExp(timestamp + between + timestamp);
		})();
		openInputFile();

		function determineShift(params) {
			var shift = ((parseInt(params['delta-hour'], 10) || 0) * 3600 +
				(parseInt(params['delta-minute'], 10) || 0) * 60 +
				(parseInt(params['delta-second'], 10) || 0)) * 1000 +
				(parseInt(params['delta-millisecond'], 10) || 0);
			if (!!params['towards-start']) {
				shift = -shift;
			}
			if (shift == 0) {
				error('shift is zero');
			}
			return shift;
		}

		function openInputFile(err) {
			if (err) {
				throw err;
			}
			fs.readFile(fileMeta.input.path, processSubtitles);
		}

		function processSubtitles(err, subtitles) {
			if (err) {
				throw err;
			}
			var lines = subtitles.toString().split('\r\n');
			var numLines = lines.length;
			for (var i = 0; i < numLines; lines[i] = processLine(lines[i]), i++);
			respond(lines.join('\r\n'));
		}

		function processLine(line) {
			var matches = line.match(timeRE);
			if (matches) {
				line = shiftTimestamp(matches);
			}
			return line.trim();
		}

		function shiftTimestamp(timestamp) {
			adjustTimestamp(timestamp, 1);
			adjustTimestamp(timestamp, 5);
			var str = sp.sprintf('%02s:%02s:%02s,%03s', timestamp[1], timestamp[2], timestamp[3], timestamp[4]);
			str += ' --> ';
			str += sp.sprintf('%02s:%02s:%02s,%03s', timestamp[5], timestamp[6], timestamp[7], timestamp[8]);
			return str;
		}

		function adjustTimestamp(timestamp, index) {
			var hourIndex = index++;
			var minutesIndex = index++;
			var secondsIndex = index++;
			var millisecondsIndex = index;
			var oldTimestampInMilliseconds = parseInt(timestamp[millisecondsIndex], 10) +
				parseInt(timestamp[secondsIndex], 10) * 1000 +
				parseInt(timestamp[minutesIndex], 10) * 60000 +
				parseInt(timestamp[hourIndex], 10) * 3600000;
			var newTimestampInMilliseconds = oldTimestampInMilliseconds + shift;
			timestamp[millisecondsIndex] = newTimestampInMilliseconds % 1000;
			newTimestampInMilliseconds -= timestamp[millisecondsIndex];
			timestamp[secondsIndex] = (newTimestampInMilliseconds / 1000) % 1000;
			newTimestampInMilliseconds -= timestamp[secondsIndex] * 1000;
			timestamp[minutesIndex] = (newTimestampInMilliseconds / 60000) % 60000;
			newTimestampInMilliseconds -= timestamp[minutesIndex] * 60000;
			timestamp[hourIndex] = Math.floor(newTimestampInMilliseconds / 3600000);
		}

		function respond(output) {
			response.attachment(fileMeta.input.name);
			response.set('Content-type', 'text/plain');
			response.send(200, output);
		}

		function error(message) {
			response.type('json');
			response.send(400, { error: message });
			throw new Error(message);
		}
	};
}());