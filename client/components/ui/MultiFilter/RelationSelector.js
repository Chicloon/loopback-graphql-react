import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import ModelInput from './ModelInput';

import { Icon } from '../index';
import './style.scss';

@inject('store', 'uiStore') @observer
class RelationSelector extends React.Component {

	@observable active = true;

	constructor (props) {
		super (props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
	}

	// componentDidMount() {
	// 	console.log('--- RelationSelector:', this.props.relation.relation);
	// }

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId)
	}

	onMouseDown(e) {
		if (this.active) {
			if (!this.node || !this.node.contains(e.target)) {
				this.hideList();
			}
		}
	}

	showList (e) {
		e.preventDefault();
		this.active = true;
		this.props.onActivate(this.props.relation);
	}

	hideList () {
		this.active = false;
		this.props.onDeactivate(this.props.relation);
	}

	removeRelation (e) {
		e.preventDefault();
		this.props.onRemove(this.props.relation.relation);
	}

	onRelationSelect (item) {
		this.hideList();
		this.props.onRelationSelect(this.props.relation, item);
	}

	render () {
		const { relation } = this.props;

		let list = null;

		if (this.active) {
			list = <div className="model-input">
				<ModelInput listModel={this.store[relation.model]}
				            outProperty={relation.outProperty}
				            computed={relation.computed}
				            value={relation.id}
				            onSelect={this.onRelationSelect.bind(this)}/>
			</div>;
		}

		const selected = relation.id ? relation.value : 'Выбрать';

		return <span className={'selected-relation' + (this.active ? ' active' : '')} ref={node => this.node = node}>
					{relation.label}: <a className="select-btn" href="#" onClick={e => this.showList(e)}>{selected}</a>
					<Icon icon="cancel" className="remove-relation" onClick={e => this.removeRelation(e)}/>
					{list}
				</span>
	}

}

RelationSelector.propTypes = {
	relation: PropTypes.object.isRequired,
	active: PropTypes.bool,
	onActivate: PropTypes.func.isRequired,
	onDeactivate: PropTypes.func.isRequired,
	onRemove: PropTypes.func.isRequired,
	onRelationSelect: PropTypes.func.isRequired,
};

export default RelationSelector;
