let debug = require ('debug')('smartplatform:budgetrole');

module.exports = function(BudgetRole) {

  	BudgetRole.setup = function() {
    	BudgetRole.base.setup.call (this);
    	var BudgetRoleModel = this;

		BudgetRoleModel.prototype.recalc = function (agentPercent, next) {
			var budgetRole = this;
			this.budget (function (err, budget) {
				if (!err && budget) {
					var percentSum;

					if (budgetRole.agent) {
						percentSum = budget.sum * budgetRole.percent;
					} else {
						percentSum = (budget.sum - budget.sum * (budget.tax + agentPercent)) * budgetRole.percent;
					}

					budgetRole.updateAttribute ('sum', Math.round (percentSum * 100) / 100);

					budget.payments ({where: {or: [{personId: budgetRole.personId}, {personId: null}]}}, function (err, payments) {
						if (!err) {
							var paid = 0;
							var havePaid = 0;
							for (var payment of payments) {
								if (payment.personId == null) {
									havePaid += payment.sum;
								} else if (!payment.projectRoleId || payment.projectRoleId == budgetRole.projectRoleId) {
									paid += payment.sum;
								}
							}

							if (budgetRole.agent) {
								havePaid = havePaid * budgetRole.percent;
							} else {
								havePaid = (havePaid - havePaid * (budget.tax + agentPercent)) * budgetRole.percent;
							}

							if (havePaid > paid) {
								paid -= havePaid;
							}

							if (!budget.sum) {
								budgetRole.updateAttribute ('sum', Math.round (havePaid * 100) / 100);
							}

							budgetRole.updateAttribute ('paid', Math.round (paid * 100) / 100);
						}
						if (next) next ();
					});
				} else {
					if (next) next ();
				}
			});
		};

		BudgetRoleModel.observe ('access', function (context, next) {
			let where = context.query.where;
			if (where && where._search) {
				context.Model.app.models.Person.find ({where: {_search: where._search}}, (error, persons) => {
					let ids = persons.map (person => {return person.id});
					where.or = [
						{ personId:		{inq: ids}}
					];
					delete where._search;
					next ();
				});
			} else {
				next ();
			}
		});

		BudgetRoleModel.afterRemote ('*.updateAttributes', function (context, budgetRole, next) {
			budgetRole.budget (function (err, budget) {
				if (!err && budget) {
					budget.recalc (next);
				} else {
					next ();
				}
			});
		});

		BudgetRoleModel.afterRemote ('create', function (context, budgetRole, next) {
			budgetRole.budget (function (err, budget) {
				if (!err && budget) {
					budget.recalc (next);
				} else {
					next ();
				}
			});
		});

	    BudgetRoleModel.afterRemote ('upsert', function (context, budgetRole, next) {
		    budgetRole.budget (function (err, budget) {
			    if (!err && budget) {
				    budget.recalc (next);
			    } else {
				    next ();
			    }
		    });
	    });

  	};

	BudgetRole.setup ();
};
