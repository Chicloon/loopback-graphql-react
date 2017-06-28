var loopbackContext = require ('loopback-context');
var debug = require ('debug')('smartplatform:mixin:owner');

/**
 * Данный mixin позволяет добавлять функционал хозяев для объектов моделей.
 * У модели появляется новое поле ownerId, который выставляется равным пользователю
 * который создал этот объект.
 */
module.exports = function (Model, options) {
	// Добавляем поле ownerId указавающее на пользователя
	Model.belongsTo ("User", {
		as: "owner",
		foreignKey: 'ownerId'
	});

	// Автоматическое присвоение ownerId для новых объектов
	Model.observe ('before save', function (context, next) {
		let accessToken = loopbackContext.getCurrentContext ().get ('accessToken');

		// Если сохраняет авторизованный пользователь и это новый объект
		// то заполняем ownerId текущим пользователем
	    if (context.isNewInstance && accessToken) {
	    	context.instance.ownerId = accessToken.userId;
	    }

	    next ();
	});

	/**
	 * Ограничение для отображения объектов для их хозяев
	 */
	/*
	Model.observe ('access', function (context, next) {
		debug ('access:', context.Model.modelName);
		context.Model.app.models.ACL.find ({
			where: {
				model: context.Model.modelName,
				property: new RegExp ('\\\$owner', 'i')
			}
		}, function (error, acls) {
			debug ('acls:', acls);
			if (!error) {
				let accessToken = loopbackContext.getCurrentContext ().get('accessToken');
				let userId = accessToken ? accessToken.userId : null;
				let includeOwner;
				acls.forEach (function (acl) {
					includeOwner = (includeOwner === 'DENY') ? 'DENY' : acl.permission;
				});
				debug ('original query:', JSON.stringify (context.query));
				if (includeOwner === 'DENY') {
					includeOwner = {or: [{ownerId: {neq: userId}}, {ownerId: null}]};
				} else if (includeOwner === 'ALLOW') {
					includeOwner = userId ? {ownerId: userId} : {id: null};
				} else {
					includeOwner = null;
				};
				if (includeOwner) {
					context.query.where = context.query.where ?
						{and: [context.query.where, includeOwner]} :
						includeOwner
					;
				};
				debug ('result query:', JSON.stringify (context.query));
			}
			next ();
		});
	});
	*/
}
