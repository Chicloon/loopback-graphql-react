module.exports = function(Payment) {

  	Payment.setup = function () {
    	Payment.base.setup.call (this);
    	var PaymentModel = this;

		PaymentModel.afterRemote ('*.updateAttributes', function (context, payment, next) {
			payment.budget (function (err, budget) {
				if (!err && budget) {
					budget.recalc (next);
				} else {
					next ();
				}
			});
		});

		PaymentModel.afterRemote ('create', function (context, payment, next) {
			payment.budget (function (err, budget) {
				if (!err && budget) {
					budget.recalc (next);
				} else {
					next ();
				}
			});
		});

	    PaymentModel.afterRemote ('upsert', function (context, payment, next) {
		    payment.budget (function (err, budget) {
			    if (!err && budget) {
				    budget.recalc (next);
			    } else {
				    next ();
			    }
		    });
	    });

	};

	Payment.setup ();
};
