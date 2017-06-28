module.exports = function (Task) {

	Task.setup = function () {
		Task.base.setup.call (this);
		let TaskModel = this;

		TaskModel.observe ('access', function (context, next) {
			// console.log ('Task.access:', JSON.stringify (context.query));
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter(String).join ('|') + ')', 'i');
				const or = [
					{ name: {regexp} },
					{ description: {regexp} },
				];
				delete where._search;
				if (Object.keys(where).length > 0) {
					where.and = [
						{ or },
						...where.and,
					];
				}
				else {
					where.or = or;
				}
			}
			next ();
		});
	};

	Task.setup ();
};
