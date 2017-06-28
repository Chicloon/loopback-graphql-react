var resolve = require('path').resolve;

/**
 * По умолчанию отправляем файл index.html, если ничего не найдено.
 */
module.exports = function urlNotFound (options) {
	return function raiseUrlNotFoundError (req, res, next) {
		var index = resolve (__dirname + '/../../build/index.html');
		res.sendFile (index);
	};
}
