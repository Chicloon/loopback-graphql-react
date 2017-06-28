module.exports = function(Client) {
	Client.setup = function () {
		Client.base.setup.call (this);
		let ClientModel = this;

		ClientModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
				where.or = [
					{ name:   		{regexp} },
					{ personName:   {regexp} },
					{ personRole:   {regexp} },
					{ phone:   		{regexp} },
					{ email:   		{regexp} },
					{ comment:   	{regexp} },
				];
				delete where._search;
			}
			next ();
		});
	};

	Client.setup ();
};
