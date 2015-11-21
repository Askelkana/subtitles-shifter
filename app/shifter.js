var sprintf = require('sprintf');
var TIME_RE = (function () {
	var timestamp = '(\\d+):(\\d+):(\\d+),(\\d+)';
	var between = '\\s+-->\\s+';
	return new RegExp(timestamp + between + timestamp);
})();
module.exports = function (req, res) {
	var file = req.file || error('No file specified.');
	var shift = determineShift(req.body);
	processSubtitles(file.buffer);

	function determineShift(params) {
		var shift =
			(
				(parseInt(params[ 'delta-hour' ], 10) || 0) * 3600 +
				(parseInt(params[ 'delta-minute' ], 10) || 0) * 60 +
				(parseInt(params[ 'delta-second' ], 10) || 0)
			) * 1000 +
			(parseInt(params[ 'delta-millisecond' ], 10) || 0);
		if ( !!params[ 'towards-start' ] ) {
			shift = -shift;
		}
		return shift || error('The shift is zero.');
	}

	function processSubtitles(input) {
		var output = input.toString().split(/\r\n/).map(function (line) {
			return processLine(line);
		}).join('\r\n');
		respond(output);
	}

	function processLine(line) {
		var matches = line.match(TIME_RE);
		if ( matches ) {
			line = shiftTimestamp(matches);
		}
		return line.trim();
	}

	function shiftTimestamp(timestamp) {
		adjustTimestamp(timestamp, 1);
		adjustTimestamp(timestamp, 5);
		return sprintf.apply(null, [ '%02s:%02s:%02s,%03s --> %02s:%02s:%02s,%03s' ].concat(timestamp));
	}

	function adjustTimestamp(timestamp, index) {
		var hourIndex = index++;
		var minutesIndex = index++;
		var secondsIndex = index++;
		var millisecondsIndex = index;
		var oldTimestampInMilliseconds =
			parseInt(timestamp[ millisecondsIndex ], 10) +
			parseInt(timestamp[ secondsIndex ], 10) * 1000 +
			parseInt(timestamp[ minutesIndex ], 10) * 60000 +
			parseInt(timestamp[ hourIndex ], 10) * 3600000;
		var newTimestampInMilliseconds = oldTimestampInMilliseconds + shift;
		timestamp[ millisecondsIndex ] = newTimestampInMilliseconds % 1000;
		newTimestampInMilliseconds -= timestamp[ millisecondsIndex ];
		timestamp[ secondsIndex ] = (newTimestampInMilliseconds / 1000) % 60;
		newTimestampInMilliseconds -= timestamp[ secondsIndex ] * 1000;
		timestamp[ minutesIndex ] = (newTimestampInMilliseconds / 60000) % 60000;
		newTimestampInMilliseconds -= timestamp[ minutesIndex ] * 60000;
		timestamp[ hourIndex ] = Math.floor(newTimestampInMilliseconds / 3600000);
	}

	function respond(output) {
		res.attachment(file.originalname);
		res.set('Content-type', 'text/plain');
		res.status(200).send(output);
	}

	function error(message) {
		res.type('json');
		res.status(400).send(sprintf('Error: %s', message));
		throw new Error(message);
	}
};
