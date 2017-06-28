import { computed, observable, action, autorun } from 'mobx';
import _ from 'lodash';
import Model from './Model';
import List from './List';

const debug = require ('debug')('smartplatform:store');

/**
 * Store for models
 */
export default class Store {
	/**
	 * API for fetching data from store
	 */
	api;

	/**
	 * Normalized object cache: cache [modelName][objectId] = observabele object
	 */
	cache = {};

	/**
	 * Models cache
	 */
	models = {};

	@observable pendingRequestCount = 0;
	@observable isInitialized = false;
	@observable isAuthorized = false;
	@observable user;
	@observable person; // Not implemented yet
	@observable error;

	constructor (api) {
		this.api = api;
		this.init ();
	}

	@computed get isLoading () {
        return this.pendingRequestCount > 0;
    }

    @action _handleError (error) {
		this.pendingRequestCount ++;
		this.isAuthorized = false;
		this.error = error;
    }

	@action login (email, password) {
		this.pendingRequestCount ++;
		return this.api.fetch ({model: 'users', path: '/login/?include=user', method: 'POST', data: {email, password}})
			.then (result => this._login (result))
			.catch (error => this._handleError (error));
	}

	@action _login (result) {
		this.isInitialized = false;
		this.isAuthorized = true;
		this.user = result.data.user;
		this.init ();
		this.pendingRequestCount --;
		return result;
	}

	@action logout () {
		this.pendingRequestCount ++;
		return this.api.fetch ({model: 'users', path: '/logout', method: 'POST'})
			.then (result => this._logout (result))
			.catch (error => this._handleError (error));
	}

	@action _logout (result) {
		this.isAuthorized = false;
		this.user = null;
		this.pendingRequestCount --;
		this.cache = {};
		return result;
	}

	@action init () {
		this.pendingRequestCount ++;
		return this.api.fetch ({model: 'models', method: 'GET'})
			.then (result => this._init (result))
			.catch (error => {
				this.isInitialized = true;
				this._handleError (error);
			});
	}

	@action _init (result) {
		result.data.forEach (modelInfo => this.initModel (modelInfo));
		this.isAuthorized = true;
		this.user = this.User.getById ('me');
		this.pendingRequestCount --;
		this.error = null;
		this.isInitialized = true;
	}

	@action initModel (modelInfo) {
		this [modelInfo.name] = Model.initModel (this, modelInfo);
	}

	/**
	 * Get objects of model by filter
	 * @param {Model}  model  model to ftech from
	 * @param {Object} filter filter options
	 */
	@action get (model, filter, modelObject, fromModel, relation) {
		this.pendingRequestCount ++;
		return this.api.get (model.API_PATH, filter, modelObject, fromModel ? fromModel.API_PATH : undefined, relation)
			.then (result => this.updateCache (model, result.data, result.totalCount)
		);
	}

	@action getById (model, id, data, include, useCache = true) {
		let cache = this.cache [model.API_PATH] = this.cache [model.API_PATH] || {};
		let object = cache [id];

		if (!object || !useCache) {
			object = cache [id] = object || new model (data || {id}, data ? false : true);
			if (!data) {
				this.api.getById (model.API_PATH, id, include)
					.then (result => {
						this.updateObject (model, result.data, object)
						object.isLoading = false; // TODO: hack implementation
					})
				;
			};
		} else if (data) {
			object.update (data);
		}

		return object;
	}

	@action put (model, data, fromModel, relation, object) {
		this.pendingRequestCount ++;
		return this.api.put (model.API_PATH, data, fromModel ? fromModel.API_PATH : undefined, relation, object)
			.then (result => {
				this.pendingRequestCount --;
				return result;
			}
		);
	}

	@action delete (model, id, fromModel, relation, object) {
		this.pendingRequestCount ++;
		return this.api.delete (model.API_PATH, id, fromModel ? fromModel.API_PATH : undefined, relation, object)
			.then (result => {
				// TODO; remove object from store
				this.pendingRequestCount --;
				return result;
			}
		);
	}

	@action uploadFile (model, id, property, file) {
		this.pendingRequestCount ++;
		return this.api.uploadFile (model.API_PATH, id, property, file);
	}

	@action downloadFile (model, id, property) {
		return this.api.downloadFile (model.API_PATH, id, property);
	}

	@action deleteFile (model, id, property) {
		return this.api.deleteFile (model.API_PATH, id, property);
	}

	/**
	 * Update store cache and returns object from cache, to deduplicate objects
	 * @param  {Model} model 	model
	 * @param  {Array} data     data to update for cache
	 * @param  {Number} totalCount total count of objects in store
	 * @return {Object}            observable objects
	 */
	@action updateCache (model, data, totalCount, isLoading = true) {
		if (!data) return null;

		let result = {data: [], totalCount};

		result.data.length = data.length;
		data.forEach ((object, index) => {
			result.data [index] = this.updateObject (model, data [index]);
		});
		this.pendingRequestCount -= (isLoading ? 1 : 0);

		return result;
	}

	/**
	 * Update object in cahe and return its observable copy from cache
	 * @param  {Model} model  model
	 * @param  {Object} object object data
	 * @return {Object}        observable object from cache
	 */
	@action updateObject (model, object, targetObject) {
		let result = null;

		if (object) {
			let cache = this.cache [model.API_PATH] = this.cache [model.API_PATH] || {};
			let cacheObject = cache [object.id] || targetObject;

			if (cacheObject) {
				cacheObject.update (object);
			} else {
				cacheObject = cache [object.id] = new model (object);
			}
			result = cacheObject;
		}

		return result;
	}
}
