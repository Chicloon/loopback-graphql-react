module.exports = function(ProjectRole) {
	ProjectRole.setup = function () {
		ProjectRole.base.setup.call (this);
		let ProjectRoleModel = this;

		ProjectRoleModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
				where.or = [
					{ name: {regexp} },
				];
				delete where._search;
			}
			next ();
		});
	};

	ProjectRole.setup ();
};
