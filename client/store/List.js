import { computed, observable, action, autorun, autorunAsync } from 'mobx';

/**
 * List - list of object of Model from Store
 */
export default class List {
	store;

	model;

	/**
	 * Filter for requested data
	 * Parameters:
	 *   where: {}
	 *   skip: number
	 *   limit: number
	 *   order: 'field (ASC|DESC)' | ['field (ASC|DESC)' ...]
	 */
	filter = {};

	@observable list = [];
	@observable isLoading = false;
	@observable totalCount;

	constructor (store, model, filter, data) {
		this.store = store;
		this.model = model;
		this.filter = filter;

		if (!data) {
			this.isLoading = true;
			autorunAsync (() => this.reload (), 0, this);
		} else {
			this.update (data, data.length);
		}
	}

	@action reload () {
		this.isLoading = true;
		this.store.get (this.model, this.filter)
			.then (result => this.update (result.data, result.totalCount)
		);
	}

	@action update (data, totalCount) {
		this.totalCount = totalCount;
		this.list.length = data.length;
		data.forEach ((object, index) => this.list [index] = object);
		this.isLoading = false;
	}

	@action more (count = 10) {
		this.filter.limit += count;
		this.reload ();
	}
}
