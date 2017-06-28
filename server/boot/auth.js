var loopback = require ('loopback');
var debug = require ('debug')('smartplatfrom:server:auth');

module.exports = function enableAuthentication (server) {

	/**
	 * Включаем стандартную авторизацию пользователей через /api/users/login|logout
	 */
	server.enableAuth ();

	/**
	 * Специальная роль $member: если у модели есть mixin Member то вовзращается true,
	 * в противном случае пользователь не принадлежит роли $member
	 */
	server.models.Role.registerResolver ('$member', function (role, context, callback) {
		if (context.model.isMember) {
			context.model.isMember (context, callback);
		} else {
			callback (null, false);
		}
	});

	/**
	 * Включаем cookie для отслеживания авторизации, в куках будет храниться access_token.
	 * Также включаем работу /api/users/me - вернет текущего авторизованного пользователя
	 */
	server.middleware ('auth', loopback.token({
		model: server.models.accessToken,
		currentUserLiteral: 'me'
	}));

	server.models.User.getDataSource ().connector.observe ('before execute', function(ctx, next) {
//		console.log ('Connector.execute:', ctx);
		next ();
	});

	//console.log ('storage connector:', server.models.Container.getDataSource ().connector);

	server.models.Container.getDataSource ().connector.observe ('before execute', function(ctx, next) {
		console.log ('Container.after.execute:', ctx);
		next ();
	});

	/**
	 * После успешной авторизации выставляюм cookie на клиенте.
	 * Loopback не поддерживает это из коробки.
	 */
	server.models.User.afterRemote ('login', function (context, accessToken, next) {
		let res = context.res;
		let req = context.req;

		if (accessToken != null) {
			if (accessToken.id != null) {
				res.cookie('access_token', accessToken.id, {
					signed: req.signedCookies ? true : false,
					maxAge: 1000 * accessToken.ttl
				});
			}
		}
		return next ();
	});

	/**
	 * После выхода пользователя чистим cookie на клиенте.
	 */
	server.models.User.afterRemote ('logout', function (context, result, next) {
		context.res.clearCookie('access_token');
		return next();
	});

	/**
	 * Добавление имени файла из атрибута объекта
	 */
	server.models.Container.beforeRemote ('download', function (context, result, next) {
		const args = context.args;
		const file = args.file.split ('-');
		let modelName;

		modelName = Object.keys (server.models).find (
			modelName => (modelName.toLowerCase () + 's') === args.container.toLowerCase ()
		);

		if (file.length == 2 && modelName) {
			let model = server.models [modelName];

			model.findById (file [0], (error, instance) => {
				if (instance && instance [file [1]]) {
					context.res.attachment (instance [file [1]]);
				}
				return next();
			});
		} else {
			return next();
		}
	});

	// Создание нулевого пользователя, если база пустая
	// var User = server.models.User;
	// User.create({email: 'mail@example.com', password: 'password'}, function(err, userInstance) {
	// 	console.log (userInstance);
	// });

};
