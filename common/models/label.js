module.exports = function(Label) {
	Label.setup = function () {
		Label.base.setup.call (this);
		let LabelModel = this;

		LabelModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
				where.or = [
					{ name:   {regexp} },
					{ description: {regexp} },
				];
				delete where._search;
			}
			next ();
		});
	};

	Label.setup ();
};
