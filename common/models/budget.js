let debug = require ('debug')('smartplatform:budget');

module.exports = function (Budget) {

	Budget.setup = function () {
		Budget.base.setup.call (this);
		var BudgetModel = this;

		BudgetModel.prototype.recalc = function (next) {
			console.log ("Budget.recalc");
			var budget = this;
			budget.budgetRoles (function (err, budgetRoles) {
				var percentLeft;
				var rolePercent = 0;
				var agentPercent = 0;
				if ( !err ) {
					var budgetRole;

					for ( budgetRole of budgetRoles ) {
						if ( budgetRole.agent ) {
							agentPercent += budgetRole.percent;
						} else {
							rolePercent += budgetRole.percent;
						}
					}
					for ( budgetRole of budgetRoles ) {
						budgetRole.recalc (agentPercent);
					}
				}
				percentLeft = 1 - (budget.tax + agentPercent) * (1 - rolePercent) - rolePercent;

				budget.updateAttribute ('percentLeft', Math.round (percentLeft * 100) / 100);

				budget.payments ({where: {personId: null}}, function (err, payments) {
					if ( !err && payments ) {
						var paid = 0;
						for ( var payment of payments ) {
							paid += payment.sum;
						}
						budget.updateAttribute ('paid', Math.round (paid * 100) / 100);
					}
					if ( next ) next ();
				});
			});
		};

		BudgetModel.afterRemote ('*.updateAttributes', function (context, budget, next) {
			budget.recalc (next);
		});

		BudgetModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				context.Model.app.models.Project.find ({where: {_search: where._search}}, (error, projects) => {
					let ids = projects.map (project => {return project.id});
					let regexp = new RegExp ('(' + where._search.split (' ').filter (String).join ('|') + ')', 'i');
					where.or = [
						{ name:   	{regexp} },
						{ comment:  {regexp} },
						{ id:		{inq: ids}}
					];
					delete where._search;
					next ();
				});
			} else {
				next ();
			}
		});
	};

	Budget.setup ();
};
