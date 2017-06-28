import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon } from '../index';
import t from '../../../../i18n';
import { Loader } from '../index';

@inject('store', 'uiStore', 'recordData') @observer
class RelationInput extends React.Component {

	@observable active = false;
	@observable list = false;
	@observable filterStr = null;
	@observable filterStrBak = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.perpage = 10;
		this.skip = this.perpage;

		this.record = this.props.recordData.record;
		this.model = this.props.recordData.model;

		this.foreignKey = this.model.RELATIONS[this.props.relation].foreignKey;
		this.relationModelName = this.model.RELATIONS[this.props.relation].model;
		this.visibleValue = this.props.loadingString;

		this.list = this.store[this.relationModelName].list({
			order: this.props.property + ' asc',
			limit: this.perpage,
		});

		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId);
	}

	onMouseDown(e) {
		if (this.active) {
			// console.log('RelationInput:', this.value, e.target);
			if (!this.node || !this.node.contains(e.target)) {
				this.active = false;
			}
		}
	}

	componentDidUpdate() {
		if (this.active && this.valueInput) {
			this.valueInput.focus();
		}
	}

	@action handleChange (e) {
		this.filterStr = e.target.value;
		// console.log('handleChange', this.filterStr);
		this.skip = this.perpage;
		this.list.filter.limit = this.perpage;
		this.list.filter.where = {
			_search: this.filterStr.trim(),
		};
		this.list.reload();
	}

	@action handleClick (e) {
		this.active = true;
		this.filterStr = this.filterStrBak;
	}

	@action handleFocus (e) {
		this.active = true;
		this.filterStr = this.filterStrBak;
	}

	@action handleBlur (e) {
		this.active = false;
		this.filterStrBak = this.filterStr;
		this.filterStr = null;
	}

	get idValue() {
		return this.record.isLoading ? null : this.record[this.foreignKey];
	}

	set idValue(newValue) {
		this.record[this.foreignKey] = newValue;
	}

	get relationRecord() {
		return this.idValue ? this.store[this.relationModelName].getById(this.idValue) : null;
	}

	get value() {
		// console.log('value!', this.relationRecord, (this.relationRecord ? this.relationRecord.isLoading : ''));
		if (this.relationRecord) {
			if (!this.relationRecord.isLoading) {
				if (!this.props.computed) {
					this.visibleValue = this.relationRecord[this.props.property];
				}
				else {
					this.visibleValue = this.props.computed(this.relationRecord);
				}
			}
			else {
				this.visibleValue = this.props.loadingString;
			}
		}
		else {
			this.visibleValue = '';
		}
		return this.visibleValue;
	}

	set value(newValue) {
		this.visibleValue = newValue;
	}

	@action selectItem(e, item) {
		e.preventDefault();
		e.stopPropagation();
		console.log('selectItem', item);
		if (item !== null) {
			this.idValue = item.id;
			this.value = !this.props.computed ? item[this.props.property] : this.props.computed(item);
		}
		else {
			this.idValue = null;
			this.value = this.props.emptyField;
		}
		this.filterStr = null;
		this.filterStrBak = null;
		this.active = false;
		// this.record[this.foreignKey] = this.idValue;
	}

	@action more(e) {
		// e.preventDefault();
		this.skip += this.perpage;
		this.list.filter.limit = this.skip;
		console.log('more:', this.list.filter);
		this.list.reload();
	}

	render () {
		if (this.relationRecord && this.relationRecord.isLoading) {
			return <div>
				Loading...
			</div>;
		}

		// console.log('- RelationInput render:', this.value);
		// console.log('--- idValue:', this.idValue);
		// console.log('--- relationRecord:', this.relationRecord);
		// console.log('--- visibleValue:', this.visibleValue);

		let inputValue = this.idValue ? '' : (!this.active ? this.props.emptyField : '');
		if (this.filterStr !== null) inputValue = this.filterStr;
		const input = this.active? <input type="text"
		                     className="form-control drop-down-search"
		                     ref={node => this.valueInput = node}
		                     value={inputValue}
		                     onFocus={e => this.handleFocus(e)}
		                     onChange={e => this.handleChange(e)}/>
			:
			<div className="placeholder" onClick={e => this.handleFocus(e)}>
				{this.value || this.props.emptyField}
			</div>;

		const items = this.list.list.map((item, i) => {
			const selected = item.id === this.idValue;
			const value = !this.props.computed ? item[this.props.property] : this.props.computed(item);
			return <a key={item.id} href="#" className={'item' + (selected ? ' selected' : '')}
		          onClick={e => this.selectItem(e, item)}>{value}</a>
		});

		const icon = <Icon className="down-icon" icon="down-open" onClick={e => this.handleClick(e)} />;

		const more = this.list.totalCount > this.perpage && this.list.totalCount > this.skip ? (
			<div className="more">
				{this.list.isLoading ?
					<Loader size={18} />
					:
					<div>
						<a href="#" onClick={e => this.more(e)}>{t('nextEllipsis')}</a>
						({t('more')}: {this.list.totalCount - this.skip})
					</div>
				}
			</div>
		) : '';

		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<input type="hidden" value={this.idValue || ''} />
				{
					!this.active ?
						<div className="drop-down">{input}{icon}</div>
						:
						<div className="drop-down active" ref={node => this.node = node}>
							{input}{icon}
							<div className="list">
								<a key='item-null' tabIndex={-1} href="#" className={'item' + (this.idValue === null ? ' selected' : '')}
								   onClick={e => this.selectItem(e, null)}>{this.props.emptyField}</a>
								{items}
								{more}
							</div>
						</div>
				}
			</div>
		);
	}
}

RelationInput.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string.isRequired,
	label: PropTypes.string,
	where: PropTypes.object,
	emptyField: PropTypes.string,
	loadingString: PropTypes.string,
};

RelationInput.defaultProps = {
	emptyField: '-',
	loadingString: 'loading...',
};

export default RelationInput;
