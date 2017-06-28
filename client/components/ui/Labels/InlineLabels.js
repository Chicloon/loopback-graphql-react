import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import ColorUtils from '../ColorUtils';
import { Icon, IconLink, ModelMultipleInput } from '../index';
import t from '../../../../i18n';
import './style.scss';

@inject('store', 'uiStore') @observer
class InlineLabels extends React.Component {

	@observable active = false;
	@observable right = false;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.record = props.record;
		this.labels = this.record.labels();
		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId);
	}

	onMouseDown (e) {
		if (this.active) {
			if (!this.node || !this.node.contains(e.target)) {
				this.active = false;
			}
		}
	}

	isLabelSelected (label) {
		if (!this.labels) return false;
		return this.labels.list.findIndex(_label => _label.id === label.id) !== -1;
	}

	taskLabel (label) {
		const selected = this.isLabelSelected(label);
		return <div className={"label-item " + (selected ? 'selected' : '')}>
			<span className="label-color" style={{ background: label.color, color: ColorUtils.textColor(label.color) }}>
				{selected ? <Icon icon="ok"/> : ''}
			</span>
			<strong>{label.name}</strong>
			<em>{label.description}</em>
		</div>;
	}

	toggleLabel (label) {
		console.log('toggleLabel:', label, this.labels);
		const index = this.labels.list.findIndex(_label => _label.id === label.id);
		if (index === -1) {
			this.labels.add(label);
		}
		else {
			this.labels.remove(label);
		}
	}

	calcPosition () {
		const containerRect = this.node.parentNode.getBoundingClientRect();
		const addRect = this.addBtn.getBoundingClientRect();
		const overflow = addRect.left - containerRect.left + 300 - containerRect.width;
		this.right = overflow > 0;
		console.log('right:', this.right);
	}

	addLabel () {
		// this.calcPosition();
		this.active = true;
	}

	removeLabel (e, label) {
		e.preventDefault();
		this.toggleLabel(label);
		// this.calcPosition();
	}

	render () {
		const selectedLabels = (this.labels && this.labels.list.length > 0) ? <div className="selected-labels">
			{this.labels.list.map(label => {
				const style = { background: label.color, color: ColorUtils.textColor(label.color) };
				return <span className="label" key={label.id} style={style}>
					{label.name}
					<Icon icon="cancel" className="remove-label" onClick={e => this.removeLabel(e, label)}/>
				</span>
			})}
		</div> : null;

		return <div className="inline-labels" ref={node => this.node = node}>
			{selectedLabels}
			<div className="add-labels" ref={node => this.addBtn = node}>
				<IconLink icon="plus" className="add-btn" onClick={e => this.addLabel()}/>
				{this.active && <ModelMultipleInput
					placeholder='Поиск метки'
					className={'inline-labels-input ' + (this.right ? 'right' : '')}
					listModel={this.store.Label}
					preloadAll={true}
					alwaysActive={true}
					inlineCreate={true}
					computed={this.taskLabel.bind(this)}
					isSelected={this.isLabelSelected.bind(this)}
					onToggleItem={item => this.toggleLabel(item)}/>}
			</div>
		</div>;
	}

}

InlineLabels.propTypes = {
	record: PropTypes.any,
	foreignKey: PropTypes.any,
};

export default InlineLabels;
