var loopback = require ('loopback');

var debug = require ('debug')('smartplatfrom:boot:01-user');

module.exports = (app) => {

	// Добавление дополнительных полей для пользователей
	// app.models.User.defineProperty ('avatar', {
	// 	type: "string",
	// 	required: false,
	// 	index: true
	// });

	// app.models.User.embedsOne ('Person', {
	// 	property: 'person'
	// });

	// Создание нулевого пользователя, если база пустая
	app.models.User.find((err, res)=> console.log(res));

	console.log('test');
	app.models.User.count ((error, count) => {
		if (!error && count === 0) {
			app.models.User.create ({email: 'mail@example.com', password: 'password'}, (error, user) => {
				debug ('Created default user', user);
			});
		};
	});
}
