var loopback = require ('loopback');
var boot = require ('loopback-boot');
var debug = require ('debug')('smartplatform:server');

var app = module.exports = loopback ();

app.start = function() {
  	return app.listen(function() {
    	app.emit('started');

    	var baseUrl = app.get('url').replace(/\/$/, '');

    	console.log('Web server listening at: %s', baseUrl);

    	if (app.get('loopback-component-explorer')) {
      		var explorerPath = app.get('loopback-component-explorer').mountPath;
      		console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    	};
  	});
};

boot (app, __dirname, function(err) {
  	if (err) {
		throw err;
	};

	// При старте сервера очищаем все данные сессий пользователей
	// для обеспечения дополнительной безопасности
	app.models.AccessToken.destroyAll ();

	// Очистка прав к моделям пользователей,
	// только для экспериментов
	app.models.User.settings.acls.length = 0;

	// Добавляем все моделям права по умолчанию DENY
	// Раскоментировать когда будут настроены все разрешения
	app.models ().forEach (model => {
		// TODO: Тут затрагиваются системные модели типа User, RoleMapping и прочие,
		//       надо решить эту проблему
		// model.settings.defaultPermission = app.models.ACL.DENY;
	});

	// Установка X-Total-Count для всех поисковых запросов, всех моделей
	app.remotes ().after ('*.find', function (ctx, next) {
    	var filter;
    	if (ctx.args && ctx.args.filter) {
      		filter = JSON.parse (ctx.args.filter).where;
    	}

    	if (!ctx.res._headerSent) {
      		this.count (filter, function (err, count) {
        		ctx.res.set('X-Total-Count', count);
        		next ();
      		});
    	} else {
      		next ();
    	}
  	});

	// Start server
  	if (require.main === module) {
    	app.start ();
	};
});
