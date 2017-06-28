import { computed, observable, action, autorun, autorunAsync } from 'mobx';
import List from './List';

/**
 * RelationList
 */
export default class RelationList extends List {

	relation;
	modelObject;

	constructor (store, model, filter, data, modelObject, relation) {
		super (store, model, filter, data);
		this.fromModel = modelObject.constructor;
		this.modelObject = modelObject;
		this.relation = relation;
	}

	@action reload () {
		this.isLoading = true;
		this.store.get (this.model, this.filter, this.modelObject, this.fromModel, this.relation)
			.then (result => this.update (result.data, result.totalCount)
		);
	}

	@action add (object) {
		this.isLoading = true;
		this.store.put (this.model, this.modelObject, this.fromModel, this.relation, object)
			.then (result => {
				this.reload (); // TODO: надежный realod вместо удаления объекта из кэша списка?
				return result;
			})
		;
	}

	@action remove (object) {
		this.isLoading = true;
		this.store.delete (this.model, this.modelObject.id, this.fromModel, this.relation, object)
			.then (result => {
				this.reload (); // TODO: надежный realod вместо удаления объекта из кэша списка?
				return result;
			})
		;
	}
}
