module.exports = function(BoardList) {
	BoardList.setup = function () {
		BoardList.base.setup.call (this);
		let BoardListModel = this;

		BoardListModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
				where.or = [
					{ name: {regexp} },
					{ description: {regexp} },
				];
				delete where._search;
			}
			next ();
		});
	};

	BoardList.setup ();
};
