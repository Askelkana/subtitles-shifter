/*
 * GET home page.
 */

exports.index = function (req, res) {
	res.render('index', {
		form:  'shift',
		title: 'Subtitles Shifter'
	});
};
