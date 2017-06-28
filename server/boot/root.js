const loopbackContext = require('loopback-context');
const debug = require ('debug') ('smartplatform::server:root');
const util = require('util');

module.exports = function (server) {
	let router = server.loopback.Router ();
	let models;

	/**
	 * Формиррование данных о моделях для передачи в клиентский MOBX Store
	 */
	models = server.models ().map (model => {
		let result = {
			name: model.definition.name,
			properties: {},
			relations: model.settings.relations,
		};
		Object.keys (model.definition.properties).forEach (propertyName => {
			let property = model.definition.properties [propertyName];
			result.properties [propertyName] = {
				type: property.type.name,
				description: property.description,
			};
		});
		return result;
	});

	/**
	 * Возвращаем описания всех моделей для генерации mobx store на клиенте
	 * Если пользователь не авторизован, возврашаем Unathorized
	 */
	router.get ('/api/models', function (req, res) {
		let context = loopbackContext.getCurrentContext ();
		let accessToken = context && context.get('accessToken');

		// Доступ только авторизованным пользователям
		if (accessToken) {
			res.send (models);
		} else {
			res.sendStatus (401); // Unauthroized
		}
	});

  	server.use (router);
};
