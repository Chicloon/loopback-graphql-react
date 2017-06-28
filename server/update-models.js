#!/usr/bin/node

let EventEmitter = require ('events');
let server = require ('./server');
let debug = require ('debug')('smartplatform:server:update');

// Убрираем ограничение по количеству Emitters
EventEmitter.defaultMaxListeners = 0;

let pgSource = server.dataSources.postgres;

/**
 * Обновляет constraints моделей
 */
let updateConstraints = (models, callback) => {
	let constraintsQuery = '';

	Object.keys (models).forEach (modelName => {
		let model = models [modelName];
		let relations = model.relations;

		Object.keys (relations || {}).forEach (relationName => {
			let relation = relations [relationName];

			if (relation.type == 'belongsTo') {
				constraintsQuery += `
					ALTER TABLE ${modelName} DROP CONSTRAINT IF EXISTS ${modelName}_${relation.modelTo.modelName}_${relation.keyTo}_fk;
					ALTER TABLE ${modelName} ADD  CONSTRAINT ${modelName}_${relation.modelTo.modelName}_${relation.keyTo}_fk
						FOREIGN KEY (${relation.keyFrom}) REFERENCES "${relation.modelTo.modelName.toLowerCase ()}" (${relation.keyTo}) ON DELETE CASCADE;
				`;
			};
		});
	});

	pgSource.connector.execute (constraintsQuery, callback);
};

debug ('Updating models...');

pgSource.autoupdate (function (error) {
	debug (error || 'OK');

	debug ('Updating constraints...');

	updateConstraints (pgSource.models, (error) => {
		debug (error || 'OK');
		pgSource.disconnect ();
	});
});
