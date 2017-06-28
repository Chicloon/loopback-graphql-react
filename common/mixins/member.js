var loopbackContext = require ('loopback-context');
var async = require ('async');
var debug = require ('debug')('smartplatform:mixin:member');

/**
 * Формирует подзапрос для связанныех объектов
 */
let getWhere = function (Model, relation, userId) {
	let where;
	if (Array.isArray (relation) && relation.length > 1) {
		let relationName = relation [0];
		let modelTo = Model.relations [relationName].modelTo;
		where = `${Model.modelName}.${Model.relations [relationName].keyFrom} in (
			select distinct ${modelTo.modelName}.${Model.relations [relationName].keyTo}
			from public.${modelTo.modelName}
			where ${getWhere (modelTo, relation.slice (1), userId, Model.relations [relationName].keyTo)}
		)`;
	} else {
		relation = (Array.isArray (relation) && relation.length == 1) ? relation [0] : relation;
		where = `${Model.relations [relation].keyFrom} = ${userId}`;
	}
	return where;
};

/**
 * Формирует подзапрос для связанныех объектов
 */
let checkMember = function (Model, relations, userId, modelId, callback) {
	debug ('checkMember', Model.modelName, relations)
	let modelName = Model.modelName;
	let join = [];
	let where = [];
	let sql;

	relations.forEach (function (relation) {
		where.push (getWhere (Model, relation, userId));
	});

	sql = `
		select ${modelName}.id from public.${modelName}
		where (${where.join (" or\n")}) ${modelId ? ` and id = ${modelId}` : ''}
	`;

	Model.getDataSource ().connector.execute (sql, [], function (error, result) {
		callback (error, result);
	});
}

/**
 * Позволяет ограничить видимость объектов по принадлежности к пользователю,
 * запрашивающему объекты модели
 * Настройки:
 * "Memeber": {
 *     "relations": [ // связи модели определяющие принадлежность к пользователю
 *         "ownerid", // все объекты у которых ownerId = запрашивающий пользователь
 *         ["members", "userId"] // путь к пользователю через связанные модели
 *     ],
 *     "roles": [     // список названий ролей для которых показываются все объекты
 *         "admin"    // все пользователи с ролью admin будут видеть все объекты
 *     ]
 * }
 */
module.exports = function (Model, options) {
	debug (Model.modelName, 'options:', options);
	let relations = options.relations || [];
	let roles = options.roles || [];

	/**
	 * Данные метод вызывается из динамической роли $member, для проверки принадлежности
	 * пользователя к объекты или модели
	 */
	Model.isMember = function (context, callback) {
		debug ('isMember:', Model.modelName, context.modelId)
		if (context.accessToken) {
			if (context.modelId) {
				checkMember (Model, relations, context.accessToken.userId, context.modelId, function (error, result) {
					callback (null, result.length > 0);
				});
			} else {
				callback (null, true);
			}
		} else {
			callback (null, false);
		}
	}

	/**
	 * Ограничиваем набор возвращаемых объектов только для их участников
	 */
	Model.observe ('access', function (context, next) {
		debug ('access:', context.Model.modelName);
		let accessToken = loopbackContext.getCurrentContext ().get('accessToken');

		// проверяем авторизован ли пользователь
		if (accessToken) {
			let userId = accessToken.userId;
			let accessContext = {principals: [{type: 'USER', id: userId}]};

			async.some (roles, function (role, callback) {
				context.Model.app.models.Role.isInRole (role, accessContext, function (error, isInRole) {
					callback (isInRole);
				});
			}, function (isInRole) {
				if (isInRole) {
					// ничего не меняем, возвращаем все объекты
					next ();
				} else {
					// возвращаем только объекты с членством
					checkMember (Model, relations, userId, undefined, function (error, result) {
						if (!error) {
							let ids = result.map (function (row) {return row.id});
							context.query.where = context.query.where ?
								{and: [context.query.where, {id: {inq: ids}}]} :
								{id: {inq: ids}}
							;
						};
						next ();
					});
				};
			});
		} else {
			// если не авторизован отрабатываем как определено в правах
			// данный случай возможен если разрешен доступ к объектам для не авторизованных
			// пользователей
			next ();
		}
	});
}
