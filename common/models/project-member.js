module.exports = function(ProjectMember) {
	ProjectMember.setup = function () {
		ProjectMember.base.setup.call (this);
		let ProjectMemberModel = this;

		ProjectMemberModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
				where.or = [
					{ comment:   {regexp} },
				];
				delete where._search;
			}
			next ();
		});
	};

	ProjectMember.setup ();
};
