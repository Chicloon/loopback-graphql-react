import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import RelationSelector from './RelationSelector';

import { Icon } from '../index';
import './style.scss';

@inject('store', 'uiStore') @observer
class MultiFilter extends React.Component {

	@observable filterText = '';
	@observable showList = false;
	@observable selectedRelations = new Map();
	@observable activeRelation = null;

	constructor (props) {
		super (props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.model = this.props.model;
		this.relationsFilters = this.props.relationsFilters.map(filter => {
			return {
				...filter,
				model: this.model.RELATIONS[filter.relation].model,
				foreignKey: this.model.RELATIONS[filter.relation].foreignKey,
			}
		});
		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
		this.filterObject = { filterText: this.props.value || '' };
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId)
	}

	onMouseDown(e) {
		if (this.showList) {
			if (!this.node || !this.node.contains(e.target)) {
				this.showList = false;
			}
		}
	}

	showRelations (e) {
		e.preventDefault();
		this.showList = true;
	}

	hideRelations () {
		this.showList = false;
	}

	addFilter (e, filter) {
		e.preventDefault();
		console.log('addFilter:', filter);
		this.selectedRelations.set(filter.relation, {...filter, id: null, value: null});
		this.hideRelations();
	}

	onTextChange (e) {
		this.filterText = e.target.value;
		this.filterObject = {...this.filterObject, filterText: this.filterText};
		if (this.props.onChange) {
			this.props.onChange(this.filterObject);
		}
	}

	onActivateRelation (relation) {
		// console.log('onActivateRelation:', relation);
		this.activeRelation = relation;
		this.showList = false;
	}

	onDeactivateRelation (relation) {
		// console.log('onDeactivateRelation:', relation);
		this.activeRelation = null;
	}

	removeRelation (relationName) {
		// console.log('removeRelation:', relationName);
		this.selectedRelations.delete(relationName);
		delete this.filterObject[relationName];
		if (this.props.onChange) {
			this.props.onChange(this.filterObject);
		}
	}

	onRelationSelect (relation, item) {
		const value = relation.computed ? relation.computed(item) : item[relation.outProperty];
		console.log(relation.label, '=', value);
		const relationName = relation.relation;
		const relationObject = {...this.selectedRelations.get(relationName)};
		relationObject.id = item.id;
		relationObject.value = value;
		this.selectedRelations.set(relationName, relationObject);
		this.activeRelation = null;
		this.filterObject = {
			...this.filterObject,
			[relationName]: relationObject,
		};
		if (this.props.onChange) {
			this.props.onChange(this.filterObject);
		}
	}

	render () {
		const canAdd = this.selectedRelations.size < this.props.relationsFilters.length && !this.activeRelation;
		const addButton = <a href="#" className={"add-filter " + (!canAdd && 'disabled')} onClick={e => this.showRelations(e)}><Icon icon="plus"/></a>;

		const relations = <div className="relations">{
			this.selectedRelations.keys().map(relationName => {
				const relation = this.selectedRelations.get(relationName);
				return <RelationSelector key={relationName} relation={relation}
				                         onActivate={this.onActivateRelation.bind(this)}
				                         onDeactivate={this.onDeactivateRelation.bind(this)}
				                         onRelationSelect={this.onRelationSelect.bind(this)}
				                         onRemove={this.removeRelation.bind(this)} />
			})
		}</div>;

		const input = <input type="text"
		                     autoFocus
		                     className="filter-input"
		                     value={this.filterText}
		                     onChange={e => this.onTextChange(e)} />;

		const relationsList = this.showList ? <div className="relations-list">
			{this.relationsFilters.map(filter => <a key={filter.relation} href="#" onClick={e => this.addFilter(e, filter)}>{filter.label}</a>)}
		</div> : '';

		return <div className="multi-filter" ref={node => this.node = node}>
			{addButton}
			{relations}
			{input}
			{relationsList}
		</div>;
	}

}

MultiFilter.propTypes = {
	relationsFilters: PropTypes.array.isRequired,
	model: PropTypes.any.isRequired,
	value: PropTypes.string,
	onChange: PropTypes.func,
};

export default MultiFilter;
