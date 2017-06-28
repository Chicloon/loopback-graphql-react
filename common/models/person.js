module.exports = function (Person) {

	Person.setup = function () {
		Person.base.setup.call (this);
		let PersonModel = this;

		PersonModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
				where.or = [
					{ lastName:   {regexp} },
					{ firstName:  {regexp} },
					{ middleName: {regexp} },
				];
				delete where._search;
			}
			next ();
		});
	};

	Person.setup ();
};
