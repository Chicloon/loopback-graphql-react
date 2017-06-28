import { computed, observable, extendObservable, action, autorun } from 'mobx';
import _ from 'lodash';
import List from './List';
import RelationList from './RelationList';
import request from 'superagent';
const debug = require ('debug')('smartplatform:model');

/**
 * Base class for any Model
 */
export default class Model {
	/**
	 * Identifier
	 */
	id;

	/**
	 * API for fetching data from store
	 */
	store;

	/**
	 * Lists cache
	 */
	listCache = {};

	@observable isLoading = false;

	constructor (object, isLoading = false) {
		object = object || {};
		this.update (object, isLoading);
	}

	@action update (object, isLoading = false) {
		for (let key in object) {
			let relation = this.constructor.RELATIONS [key];
			if ( relation ) {
				let value = object [key];
				if (relation.type === 'hasMany') {
					this.getHasMany (key, {}, value);
				} else if (relation.type === 'hasAndBelongsToMany') {
					this.getHasMany (key, {}, value, this, key);
				} else if (relation.type === 'belongsTo') {
					this.getBelongsTo (key, value);
				}
			} else if (this [key] !== object [key]) {
				this [key] = object [key];
			}
		}
		this.isLoading = isLoading;
	}

	@action reload (include) {
		this.isLoading = true;
		return this.constructor.STORE.getById (this.constructor, this.id, null, include, false);
	}

	@action save () {
		this.isLoading = true;
		return this.constructor.STORE.put (this.constructor, this.toJSON ())
			.then (result => {
				this.isLoading = false;
				return result;
			});
	}

	@action delete () {
		this.isLoading = true;
		return this.constructor.STORE.delete (this.constructor, this.id);
	}

	@action uploadFile (property, file) {
		return this.constructor.STORE.uploadFile (this.constructor, this.id, property, file);
	}

	@action downloadFile (property) {
		return this.constructor.STORE.downloadFile (this.constructor, this.id, property);
	}

	@action deleteFile (property) {
		return this.constructor.STORE.deleteFile (this.constructor, this.id, property);
	}

	toJSON () {
		let result = {
			id: this.id
		};
		let properties = this.constructor.PROPERTIES;

		properties.forEach (propertyName => {
			result [propertyName] = this [propertyName];
		});

		return result;
	}

	getHasMany (relationName, filter, data, relationList = false) {
		filter = filter || {};
		let relation = this.constructor.RELATIONS [relationName];
		let filterKey = `${relationName}.${JSON.stringify (filter)}`;
		let list = this.listCache [filterKey];
		let model = this.constructor.STORE [relation.model];

		if (!list) {
			filter.where = filter.where || {};

			if (!relationList) {
				filter.where [relation.foreignKey] = this.id;
			}

			data = data ?
				this.constructor.STORE.updateCache (model, data, data ? data.length : null, false).data :
				null
			;

			let ListClass = relationList ? RelationList : List;

			list = this.listCache [filterKey] = new ListClass (
				this.constructor.STORE,
				model, filter,
				data,
				this, relationName // RelationList arguments
			);
		} else if (data) {
			list.update (this.constructor.STORE.updateCache (model, data, data.length, false).data, data.length);
		}

		return list;
	}

	getBelongsTo (relationName, data) {
		let relation = this.constructor.RELATIONS [relationName];
		let relationId = this [relation.foreignKey];
		let result = relationId;

		if (relationId) {
			result = this.constructor.STORE.getById (this.constructor.STORE [relation.model], relationId, data);
		}

		return result;
	}

	@action setBelongsTo (relationName, value) {
		let relation = this.constructor.RELATIONS [relationName];
		let relationId = this [relation.foreignKey];
		let newRelationId = (value || {}).id;

		if (newRelationId !== relationId) {
			this [relation.foreignKey] = newRelationId;

			if (this [relationName] !== value) {
				this.save ();
			}
		}
	}

	static initModel (store, modelInfo) {
		let properties = Model.initProperties (modelInfo);
		let relations = modelInfo.relations || [];
		let model = class extends Model {
			constructor (object, isLoading) {
				super (object, isLoading);
			}

			static API_PATH = `${modelInfo.name.toLowerCase()}s`;
			static MODEL_INFO = modelInfo;
			static PROPERTIES = properties;
			static RELATIONS = relations;
			static STORE = store;

			static list (filter) {
				// TODO: To be cached...
				return new List (store, model, filter);
			}

			static getById (id, data, include, useCache = true) {
				return store.getById (model, id, data, include, useCache);
			}
		};

		properties && properties.forEach (propertyName => {
			observable (model.prototype, propertyName)
		});

		relations && Object.keys (relations).forEach (relationName => {
			let relation = relations [relationName];
			let relationType = relation.type;
			let relationDescription = {};

			switch (relationType) {
				case 'belongsTo':
					relationDescription = {
						get: function () {
							return this.getBelongsTo (relationName);
						},
						set: function (value) {
							this.setBelongsTo (relationName, value);
						}
					};
				break;
				case 'hasMany':
					relationDescription = {
						writable: false,
						value: function (filter) {
							return this.getHasMany (relationName, filter);
						}
					};
				break;
				case 'hasAndBelongsToMany':
					relationDescription = {
						writable: false,
						value: function (filter) {
							return this.getHasMany (relationName, filter, null, true);
						}
					};
				break;
				default:
					debug ('Unknown relation:', relationName, relationType);
				break;
			}

			Object.defineProperty (model.prototype, relationName, relationDescription);
		});

		return model;
	}

	static initProperties (modelInfo) {
		let properties = modelInfo.properties && Object.keys (modelInfo.properties);

		modelInfo.relations && Object.keys (modelInfo.relations).forEach (relationName => {
			let relation = modelInfo.relations [relationName];
			if (relation.type === 'belongsTo') {
				properties.push (relation.foreignKey);
			}
		});

		return properties;
	}
}
